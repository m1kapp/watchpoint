/**
 * WKBL 선수별 커리어 스탯 + 수상 이력 수집
 *
 * 실행: npx tsx scripts/scrape/wkbl/career-seasons.ts
 *
 * - ajax_detail_sumUp.asp  → 전 시즌 스탯 (1회 요청으로 전체 커리어)
 * - ajax_detail_prize.asp  → 수상 / 기록 이력 → career_highlights
 * - 결과를 data/wkbl/players.json에 career_seasons, career_highlights로 저장
 *
 * 핵심: EUC-KR 응답을 Buffer 그대로 cheerio에 전달해야 한국어가 정상 출력됨.
 * (TextDecoder('euc-kr')는 일부 문자 오매핑 발생)
 */

import fs from "fs/promises";
import path from "path";
import * as cheerio from "cheerio";
import { WKBL_BASE } from "./constants";
import type { ScrapedPlayer } from "./players";

const SUMUP_URL = `${WKBL_BASE}/player/ajax/ajax_detail_sumUp.asp`;
const PRIZE_URL = `${WKBL_BASE}/player/ajax/ajax_detail_prize.asp`;
const PLAYERS_PATH = path.resolve(process.cwd(), "data/wkbl/players.json");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function postRaw(url: string, body: Record<string, string>, retries = 3): Promise<Buffer> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          Referer: `${WKBL_BASE}/player/detail.asp`,
        },
        body: new URLSearchParams(body).toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(800 * (i + 1));
    }
  }
  throw new Error("unreachable");
}

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface SeasonRow {
  season: string;
  team: string;
  games: number;
  points: number;
  rebounds: number;
  assists: number;
}

interface CareerHighlight {
  type: "award" | "record";
  label: string;
}

// ─── sumUp 파싱 ───────────────────────────────────────────────────────────────
// 테이블 1: 평균 (MPG, 2P%, ..., PPG)  ← 사용
// 테이블 2: 합계 (MIN, FGM-A, ...)     ← 무시
//
// 평균 테이블 컬럼:
//   season | team | G | MPG | 2P% | 3P% | FT% | OFF | DEF | TOT | APG | SPG | BPG | TO | PF | PPG

function parseSumUp(buf: Buffer): SeasonRow[] {
  // EUC-KR 응답을 Buffer 그대로 cheerio에 전달 → 정상 한글 인식
  const $ = cheerio.load(buf, {});
  const rows: SeasonRow[] = [];

  // 첫 번째 테이블만 사용 (두 번째는 누적 합계)
  $("table").first().find("tbody tr").each((_, tr) => {
    const cells: string[] = [];
    $(tr).find("td").each((_, td) => cells.push($(td).text().trim()));
    if (cells.length < 16) return;

    // "2025-2026" → "2025-26"
    const rawSeason = cells[0] ?? "";
    const seasonMatch = rawSeason.match(/(\d{4})-(\d{4})/);
    if (!seasonMatch) return;
    const season = `${seasonMatch[1]}-${seasonMatch[2].slice(2)}`;

    const at = (i: number) => parseFloat(cells[i] ?? "") || 0;
    const games = at(2);
    if (!games) return;

    rows.push({
      season,
      team: cells[1] ?? "",
      games,
      points: at(15),
      rebounds: at(9),
      assists: at(10),
    });
  });

  return rows;
}

// ─── prize 파싱 ───────────────────────────────────────────────────────────────
// 컬럼: season | team | category(정규시즌/플레이오프/기록부) | award/record

// 의미 있는 수상만 포함 (라운드/주간 MVP 등 잡다한 건 제외)
const AWARD_KEEP_RE = /^(시즌\s*MVP|정규시즌\s*MVP|MVP$|BEST\s*5|신인왕|신인선수상|챔피언십\s*MVP|파이널\s*MVP|우수수비상|최우수|올스타)/i;
// 제외할 패턴: "N라운드 - MVP", "Round N MVP" 형태의 잡다한 라운드 MVP
const AWARD_SKIP_RE = /^\d+라운드|^\d+\s*round|^round\s*\d+|^(주간|이달의|경기)\s*(MVP|MIP)/i;
// 기록부 세부 수치 행 패턴 (숫자+단위)
const RECORD_VALUE_RE = /[\d,.]+\s*(개|점|초|%)/;

function parsePrize(buf: Buffer): CareerHighlight[] {
  const $ = cheerio.load(buf, {});
  const highlights: CareerHighlight[] = [];
  const seen = new Set<string>();

  $("tbody tr").each((_, tr) => {
    const cells: string[] = [];
    $(tr).find("td").each((_, td) => cells.push($(td).text().trim()));
    if (cells.length < 4) return;

    const season   = cells[0] ?? "";
    const category = cells[2] ?? "";
    const label    = cells[3] ?? "";

    if (!label || !season) return;

    // 세부 수치 행 스킵 (e.g. "12.89개", "1,322.80점")
    if (RECORD_VALUE_RE.test(label)) return;

    // 라운드 MVP, 주간 MVP, MIP 등 잡다한 수상 제외
    if (AWARD_SKIP_RE.test(label)) return;

    // 의미 있는 수상만 포함 (기록부는 별도)
    const isRecord = category.includes("기록");
    const isAward  = !isRecord;
    const type: "award" | "record" = isAward ? "award" : "record";

    // "2025-2026" → "25-26"
    const m = season.match(/(\d{4})-(\d{4})/);
    const short = m ? `${m[1].slice(2)}-${m[2].slice(2)}` : season;

    const full = `${short} ${label}`;
    if (seen.has(full)) return;
    seen.add(full);

    highlights.push({ type, label: full });
  });

  return highlights;
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

async function main() {
  const raw = await fs.readFile(PLAYERS_PATH, "utf-8");
  const players: (ScrapedPlayer & {
    career_seasons?: SeasonRow[];
    career_highlights?: CareerHighlight[];
  })[] = JSON.parse(raw);

  const total = players.length;
  console.log(`\n🏀 커리어 데이터 수집 시작 (${total}명)\n`);

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    process.stdout.write(`  [${String(i + 1).padStart(3)}/${total}] ${p.name.padEnd(8)} `);

    const body = { season_gu: "046", player_no: p.pno, active_yn: "0" };

    // ── sumUp: 전 시즌 스탯 ──
    let seasons: SeasonRow[] = [];
    try {
      const buf = await postRaw(SUMUP_URL, body);
      seasons = parseSumUp(buf);
      // draftYear 이전 시즌 제거 (안전 필터)
      if (p.draftYear) {
        seasons = seasons.filter((r) => parseInt(r.season.split("-")[0]) >= p.draftYear!);
      }
      process.stdout.write(`${seasons.length}시즌 `);
    } catch {
      process.stdout.write(`(sumUp 실패) `);
    }
    await sleep(120);

    // ── prize: 수상 이력 ──
    let highlights: CareerHighlight[] = [];
    try {
      const buf = await postRaw(PRIZE_URL, body);
      highlights = parsePrize(buf);
      if (highlights.length) process.stdout.write(`+${highlights.length}수상 `);
    } catch {
      // 수상 없음 — 무시
    }
    await sleep(120);

    p.career_seasons    = seasons.length    > 0 ? seasons    : undefined;
    p.career_highlights = highlights.length > 0 ? highlights : undefined;

    console.log();
  }

  await fs.writeFile(PLAYERS_PATH, JSON.stringify(players, null, 2), "utf-8");
  console.log(`\n✅ 저장 완료 → ${PLAYERS_PATH}`);
}

main().catch(console.error);
