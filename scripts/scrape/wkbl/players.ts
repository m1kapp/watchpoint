/**
 * WKBL 선수 데이터 크롤러
 *
 * 실행: npx tsx scripts/scrape/wkbl-players.ts
 * 출력: src/lib/generated/players.json
 */

import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import { CURRENT_SEASON_GU, WKBL_BASE, WKBL_URLS } from "./constants";
import teamsJson from "../../../data/wkbl/teams.json" with { type: "json" };

// ─── 상수 ────────────────────────────────────────────────────────────────────

const BASE_URL = WKBL_BASE;
const PLAYER_LIST_URL  = `${BASE_URL}/player/player_list.asp`;
const PLAYER_DETAIL_URL = `${BASE_URL}/player/detail.asp`;
const PLAYER_STATS_URL  = WKBL_URLS.playerStats();

const SEASON_GU = CURRENT_SEASON_GU;

/** tcode → 팀 정보 (teams.json 기반) */
const TEAM_CODE_MAP = Object.fromEntries(teamsJson.map((t) => [t.tcode, t]));

/** WKBL 포지션 → 앱 Position 타입 */
const POSITION_MAP: Record<string, string> = {
  G: "PG", PG: "PG", SG: "SG",
  F: "SF", SF: "SF", PF: "PF",
  C: "C",  GF: "SG", FC: "PF", FG: "SG",
};

// ─── 타입 ────────────────────────────────────────────────────────────────────

export interface ScrapedPlayer {
  pno: string;
  teamId: string;
  teamName: string;
  /** 한글 이름 (data-kr 속성) */
  name: string;
  /** 영문 이름 (data-en 속성) */
  nameEn: string;
  number: number | null;
  position: string | null;
  height: string | null;
  weight: string | null;
  birthDate: string | null;   // "1987-09-07"
  birthYear: number | null;
  school: string | null;
  draftYear: number | null;
  draftRound: number | null;
  draftPick: number | null;
  /** WKBL 공식 이미지 URL */
  imageUrl: string;
  seasonStats: SeasonStats | null;
}

export interface SeasonStats {
  games: number | null;
  mpg: number | null;
  ppg: number | null;
  rpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  fgPct: number | null;
  threePct: number | null;
  ftPct: number | null;
}

// ─── HTTP 유틸 ────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchEucKr(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Referer: BASE_URL,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error("unreachable");
}

async function postEucKr(url: string, body: Record<string, string>, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          Referer: PLAYER_DETAIL_URL,
        },
        body: new URLSearchParams(body).toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * (i + 1));
    }
  }
  throw new Error("unreachable");
}

// ─── 파싱 함수 ───────────────────────────────────────────────────────────────

/** 선수 목록 페이지 → pno 배열 */
function parsePnoList(html: string): string[] {
  const $ = cheerio.load(html);
  const pnos: string[] = [];
  $("a[href*='pno=']").each((_, el) => {
    const m = ($(el).attr("href") ?? "").match(/pno=(\d+)/);
    if (m) pnos.push(m[1]);
  });
  return [...new Set(pnos)];
}

/** 선수 상세 페이지 파싱 */
function parsePlayerDetail(html: string, pno: string, tcode: string): Omit<ScrapedPlayer, "seasonStats"> {
  const $ = cheerio.load(html);
  // tcode로 팀 찾기, 없으면 나중에 상세 페이지에서 추출
  let team = TEAM_CODE_MAP[tcode] ?? { teamId: "", teamName: "" };

  // ── 이름 + 등번호 ──
  const $h3 = $("h3.tit_name");
  const nameSpan = $h3.find("span.language").first();
  const nameKr = nameSpan.attr("data-kr")?.trim() ?? "";
  const nameEn = nameSpan.attr("data-en")?.trim() ?? "";

  // ── 팀명 (상세 페이지 txt_team에서 재확인, nameEn으로 매칭) ──
  const teamSpanEn = $h3.find("span.txt_team").attr("data-en")?.trim() ?? "";
  // data-en 예: "[HANA BANK]", "[SAMSUNG LIFE]" 등
  const NAME_EN_MAP = Object.fromEntries(teamsJson.map((t) => [t.nameEn, t]));
  const teamKey = teamSpanEn.replace(/[\[\]]/g, "").trim();
  if (teamKey && NAME_EN_MAP[teamKey]) {
    team = NAME_EN_MAP[teamKey];
  }

  const h3Text = $h3.text().trim();
  const numberMatch = h3Text.match(/No\.(\d+)/);
  const number = numberMatch ? parseInt(numberMatch[1]) : null;

  // ── 프로필 이미지 (WKBL 자체 URL) ──
  const profileStyle = $("div.profile_view").attr("style") ?? "";
  const bgMatch = profileStyle.match(/url\(([^)]+)\)/);
  const imageUrl = bgMatch
    ? bgMatch[1].startsWith("http")
      ? bgMatch[1]
      : `${BASE_URL}${bgMatch[1]}`
    : `${BASE_URL}/static/images/player/pimg/np_${pno}.png`;

  // ── 프로필 정보 (ul.list_text li) ──
  // 각 li 안에 span[data-en]으로 레이블 식별
  const info: Record<string, string> = {};
  $("ul.list_text li").each((_, li) => {
    const $li = $(li);
    const $span = $li.find("span.language").first();
    const label = $span.attr("data-en")?.trim() ?? "";
    if (!label) return;

    // span 제거 후 나머지 텍스트 추출 (br 포함 드래프트 대응)
    $span.remove();
    const rest = $li.text().trim().replace(/^[\s\-]+/, "").trim();
    if (rest) info[label] = rest;
  });

  // ── 포지션 ──
  const posRaw = info["Position"] ?? "";
  const position = (POSITION_MAP[posRaw.trim().toUpperCase()] ?? posRaw.trim()) || null;

  // ── 신장 / 체중 ──
  const heightRaw = info["Height"] ?? "";
  const heightNum = heightRaw.match(/(\d+)/)?.[1];
  const height = heightNum ? `${heightNum}cm` : null;

  const weightRaw = info["Weight"] ?? "";
  const weightNum = weightRaw.match(/(\d+)/)?.[1];
  const weight = weightNum ? `${weightNum}kg` : null;

  // ── 생년월일 ──
  const birthRaw = info["Birth"] ?? "";
  const birthMatch = birthRaw.match(/(\d{4})[.\-](\d{1,2})[.\-](\d{1,2})/);
  const birthDate = birthMatch
    ? `${birthMatch[1]}-${birthMatch[2].padStart(2, "0")}-${birthMatch[3].padStart(2, "0")}`
    : null;
  const birthYear = birthMatch ? parseInt(birthMatch[1]) : null;

  // ── 출신학교 ──
  // school은 한글이라 EUC-KR 디코딩된 값이 그대로 들어옴
  const school = info["School"]?.trim() || null;

  // ── 드래프트 ──
  const draftRaw = info["Draft"] ?? "";
  const draftYearMatch = draftRaw.match(/(\d{4})/);
  const draftRoundMatch = draftRaw.match(/(\d+)라운드|(\d+)round/i);
  const draftPickMatch  = draftRaw.match(/(\d+)순위|(\d+)순위|(\d+)pick/i);
  const draftYear  = draftYearMatch  ? parseInt(draftYearMatch[1])  : null;
  const draftRound = draftRoundMatch ? parseInt(draftRoundMatch[1] ?? draftRoundMatch[2]) : null;
  const draftPick  = draftPickMatch  ? parseInt(draftPickMatch[1]  ?? draftPickMatch[2])  : null;

  return {
    pno,
    teamId: team.teamId,
    teamName: team.teamName,
    name: nameKr,
    nameEn,
    number,
    position,
    height,
    weight,
    birthDate,
    birthYear,
    school,
    draftYear,
    draftRound,
    draftPick,
    imageUrl,
  };
}

/** 시즌 스탯 Ajax 응답 파싱
 *
 * WKBL 스탯 테이블 구조:
 *   thead row1: 팀명 G MPG 2PM-A 2P% 3PM-A 3P% FTM-A FT% REBOUNDS(colspan=3) APG SPG BPG TO PF PPG
 *   thead row2:                                                               OFF DEF TOT
 *   tbody: 팀명 G MPG 2PM-A 2P% 3PM-A 3P% FTM-A FT% [OFF] [DEF] [TOT] APG SPG BPG TO PF PPG ...
 *
 * REBOUNDS가 colspan=3이라서 th 인덱스와 td 인덱스가 +2 어긋남 (idx >= REBOUNDS_IDX+1 이후)
 */
function parseSeasonStats(html: string): SeasonStats {
  const $ = cheerio.load(html);

  // 정규시즌 첫 행만 사용 (tbody의 첫 번째 tr)
  const cells: string[] = [];
  $("tbody tr").first().find("td").each((_, el) => { cells.push($(el).text().trim()); });

  if (cells.length === 0) {
    return { games: null, mpg: null, ppg: null, rpg: null, apg: null, spg: null, bpg: null, fgPct: null, threePct: null, ftPct: null };
  }

  // 고정 컬럼 위치 (WKBL 스탯 테이블 기준)
  // cells: [팀명(0), G(1), MPG(2), 2PM-A(3), 2P%(4), 3PM-A(5), 3P%(6), FTM-A(7), FT%(8),
  //         OFF(9), DEF(10), TOT(11), APG(12), SPG(13), BPG(14), TO(15), PF(16), PPG(17)]
  const at = (idx: number): number | null => {
    const v = parseFloat(cells[idx] ?? "");
    return isNaN(v) ? null : v;
  };

  // MPG: "18:11" 형식 → 분 단위
  let mpg: number | null = null;
  const mpgRaw = cells[2] ?? "";
  const mpgMatch = mpgRaw.match(/(\d+):(\d+)/);
  if (mpgMatch) {
    mpg = parseInt(mpgMatch[1]) + parseInt(mpgMatch[2]) / 60;
  } else {
    mpg = parseFloat(mpgRaw) || null;
  }

  return {
    games:    at(1),
    mpg:      mpg ? parseFloat(mpg.toFixed(1)) : null,
    ppg:      at(17),
    rpg:      at(11),   // TOT rebounds
    apg:      at(12),
    spg:      at(13),
    bpg:      at(14),
    fgPct:    at(4),
    threePct: at(6),
    ftPct:    at(8),
  };
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏀 WKBL 선수 데이터 크롤링 시작\n");

  // 1단계: 팀별 pno 수집
  console.log("── 1단계: 선수 목록 수집 ──");
  const pnoToTeam = new Map<string, string>();

  for (const tcode of Object.keys(TEAM_CODE_MAP)) {
    const teamInfo = TEAM_CODE_MAP[tcode];
    const url = `${PLAYER_LIST_URL}?player_group=12&tcode=${tcode}`;
    process.stdout.write(`  ${teamInfo.teamName} (tcode=${tcode || "기본"}) ... `);
    try {
      const html = await fetchEucKr(url);
      const pnos = parsePnoList(html);
      for (const pno of pnos) {
        if (!pnoToTeam.has(pno)) pnoToTeam.set(pno, tcode);
      }
      console.log(`${pnos.length}명`);
    } catch (e) {
      console.log(`실패: ${e}`);
    }
    await sleep(400);
  }

  console.log(`\n총 ${pnoToTeam.size}명\n`);

  // 2단계: 선수 상세 + 스탯
  console.log("── 2단계: 선수 상세 + 시즌 스탯 수집 ──");
  const players: ScrapedPlayer[] = [];
  let idx = 0;

  for (const [pno, tcode] of pnoToTeam) {
    idx++;
    process.stdout.write(`  [${String(idx).padStart(2)}/${pnoToTeam.size}] pno=${pno} `);
    try {
      // 상세 페이지
      const detailHtml = await fetchEucKr(
        `${PLAYER_DETAIL_URL}?player_group=12&tcode=${tcode}&pno=${pno}`
      );
      const base = parsePlayerDetail(detailHtml, pno, tcode);
      process.stdout.write(`${base.name || "(이름없음)"} `);

      // 시즌 스탯
      let seasonStats: SeasonStats | null = null;
      try {
        const statsHtml = await postEucKr(PLAYER_STATS_URL, {
          season_gu: SEASON_GU,
          player_no: pno,
          active_yn: "0",
        });
        seasonStats = parseSeasonStats(statsHtml);
        process.stdout.write(`(스탯 ${seasonStats.games ?? "?"}경기) `);
      } catch {
        process.stdout.write(`(스탯실패) `);
      }

      players.push({ ...base, seasonStats });
      console.log("✓");
    } catch (e) {
      console.log(`✗ ${e}`);
    }

    await sleep(350);
  }

  // 3단계: 저장
  const dataDir = process.env.WKBL_DATA_DIR ?? "data/wkbl";
  await fs.mkdir(path.resolve(process.cwd(), dataDir), { recursive: true });
  const outputPath = path.resolve(process.cwd(), `${dataDir}/players.json`);
  await fs.writeFile(outputPath, JSON.stringify(players, null, 2), "utf-8");

  console.log(`\n✅ ${players.length}명 저장 → ${outputPath}`);

  const byTeam = players.reduce<Record<string, number>>((acc, p) => {
    acc[p.teamId] = (acc[p.teamId] ?? 0) + 1;
    return acc;
  }, {});
  console.log("팀별:", byTeam);
}

main().catch(console.error);
