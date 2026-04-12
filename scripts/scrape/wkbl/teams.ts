/**
 * WKBL 팀 메타데이터 크롤러
 *
 * 실행: npx tsx scripts/scrape/wkbl/teams.ts
 * 출력: data/wkbl/teams.json
 *
 * 소스:
 *   - wkbl.or.kr/player/player_list.asp (tcode + 한글 팀명)
 *   - api-gw.sports.naver.com (naverName)
 *
 * 참고:
 *   teamId는 팀 영문 축약명 기반 내부 식별자로,
 *   이 스크립트 내 TEAM_ID_MAP에서 관리됩니다.
 *   nameEn은 선수 상세 페이지의 data-en 속성값 기준입니다.
 */

import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import { WKBL_BASE, NAVER_SCORES_URL } from "./constants.js";

// ─── 내부 팀 ID 매핑 (한글 팀명 핵심어 → teamId + nameEn) ────────────────────
// teams.json이 생성된 후에는 이 스크립트만 수정하면 됩니다.
// nameEn은 WKBL 선수 상세 페이지 data-en 속성 기준 (변경 거의 없음).

const TEAM_META: Record<string, { teamId: string; nameEn: string }> = {
  "KB":    { teamId: "kb",      nameEn: "KB STARS" },
  "삼성":  { teamId: "samsung", nameEn: "SAMSUNG LIFE" },
  "우리":  { teamId: "woori",   nameEn: "WOORI BANK" },
  "신한":  { teamId: "shinhan", nameEn: "SHINHAN BANK" },
  "하나":  { teamId: "hana",    nameEn: "HANA BANK" },
  "BNK":   { teamId: "bnk",     nameEn: "BNK SUM" },
};

function resolveTeamMeta(teamName: string): { teamId: string; nameEn: string } | null {
  for (const [key, meta] of Object.entries(TEAM_META)) {
    if (teamName.includes(key)) return meta;
  }
  return null;
}

// ─── WKBL 팀 상세 페이지 → 풀네임 파싱 ─────────────────────────────────────

async function fetchFullTeamName(tcode: string): Promise<string | null> {
  // WKBL 팀 상세 페이지: /team/teaminfo.asp?team_code={tcode}
  const url = `${WKBL_BASE}/team/teaminfo.asp?team_code=${tcode}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Referer: WKBL_BASE,
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    // <h3>신한은행 에스버드</h3> 패턴
    const name = $("h3").filter((_, el) => {
      const t = $(el).text().trim();
      return t.length > 2 && /[가-힣]/.test(t);
    }).first().text().trim();
    return name || null;
  } catch {
    return null;
  }
}

// ─── WKBL 선수 목록 페이지 → 팀 드롭다운 파싱 ──────────────────────────────

async function fetchTeamList(): Promise<{ tcode: string; teamName: string }[]> {
  // tcode 기준 중복 제거
  const url = `${WKBL_BASE}/player/player_list.asp?player_group=12`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: WKBL_BASE,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  const teams: { tcode: string; teamName: string }[] = [];

  // tcode가 있는 select option 추출 (빈 값 제외, tcode 중복 제거)
  const seen = new Set<string>();
  $("select[name='tcode'] option, select option[value]").each((_, el) => {
    const val = $(el).attr("value")?.trim() ?? "";
    const name = $(el).text().trim();
    if (val && val !== "" && name && name !== "전체" && !seen.has(val)) {
      seen.add(val);
      teams.push({ tcode: val, teamName: name });
    }
  });

  return teams;
}

// ─── Naver API → naverName 매핑 ──────────────────────────────────────────────

async function fetchNaverTeamNames(): Promise<string[]> {
  const fromDate = "2025-10-01";
  const toDate   = "2026-06-30";
  const res = await fetch(NAVER_SCORES_URL(fromDate, toDate), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Referer": "https://m.sports.naver.com/basketball/schedule/index?category=wkbl",
      "X-Sports-Backend": "kotlin",
    },
  });
  if (!res.ok) throw new Error(`Naver API HTTP ${res.status}`);
  const json = await res.json();
  const games = (json?.result?.games ?? []) as { homeTeamName: string; awayTeamName: string }[];
  const names = new Set<string>();
  for (const g of games) {
    if (g.homeTeamName) names.add(g.homeTeamName);
    if (g.awayTeamName) names.add(g.awayTeamName);
  }
  return [...names];
}

function matchNaverName(teamName: string, naverNames: string[]): string {
  // 한글 핵심어로 매칭
  for (const key of Object.keys(TEAM_META)) {
    if (teamName.includes(key)) {
      // naverNames에서 같은 키워드를 포함하는 이름 찾기
      const matched = naverNames.find((n) => n.includes(key));
      if (matched) return matched;
    }
  }
  return teamName;
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏀 WKBL 팀 메타 수집 시작\n");

  // 1. WKBL 사이트에서 tcode + 팀명 가져오기
  console.log("── WKBL 팀 목록 파싱 ──");
  const wkblTeams = await fetchTeamList();
  console.log(`  ${wkblTeams.length}팀 발견: ${wkblTeams.map((t) => t.teamName).join(", ")}\n`);

  // 2. Naver API에서 naverName 가져오기
  console.log("── Naver 팀명 수집 ──");
  const naverNames = await fetchNaverTeamNames();
  console.log(`  Naver 팀명: ${naverNames.join(", ")}\n`);

  // 3. 팀 상세 페이지에서 풀네임 가져오기
  console.log("── 팀 풀네임 수집 ──");
  const fullNames = new Map<string, string>();
  for (const t of wkblTeams) {
    const full = await fetchFullTeamName(t.tcode);
    fullNames.set(t.tcode, full ?? t.teamName);
    console.log(`  tcode=${t.tcode} → ${full ?? "(못 가져옴, 기본명 사용)"}`);
    await new Promise((r) => setTimeout(r, 300));
  }

  // 4. 조합
  const result = wkblTeams.map((t) => {
    const meta = resolveTeamMeta(t.teamName);
    const naverName = matchNaverName(t.teamName, naverNames);
    const teamName = fullNames.get(t.tcode) ?? t.teamName;
    return {
      teamId:   meta?.teamId  ?? t.tcode,
      tcode:    t.tcode,
      teamName,
      nameEn:   meta?.nameEn ?? "",
      naverName,
    };
  });

  const dataDir = process.env.WKBL_DATA_DIR ?? "data/wkbl";
  await fs.mkdir(path.resolve(process.cwd(), dataDir), { recursive: true });
  const outputPath = path.resolve(process.cwd(), `${dataDir}/teams.json`);
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");

  console.log("✅ teams.json 저장 완료:");
  result.forEach((t) =>
    console.log(`  ${t.teamId} | tcode=${t.tcode} | ${t.teamName} | naver=${t.naverName}`)
  );
}

main().catch(console.error);
