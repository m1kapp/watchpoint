/**
 * 네이버 스포츠 KBL 경기 결과 크롤러
 *
 * 실행: npx tsx scripts/scrape/kbl/scores.ts
 * 출력: data/kbl/scores.json
 */

import fs from "fs/promises";
import path from "path";
import { NAVER_SCORES_URL, ROUND_CODE_MAP, SEASON_FROM, SEASON_TO } from "./constants";
import teamsJson from "../../../data/kbl/teams.json" with { type: "json" };

// naverName("고양 소노") → shortName("소노")
const NAVER_TO_SHORT = Object.fromEntries(teamsJson.map((t) => [t.naverName, t.shortName]));
const toShort = (naverName: string) => NAVER_TO_SHORT[naverName] ?? naverName;

interface NaverGame {
  gameId: string;
  gameDate: string;
  gameDateTime: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamCode: string;
  awayTeamCode: string;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  winner: "HOME" | "AWAY" | "DRAW" | null;
  statusCode: "RESULT" | "BEFORE" | "STARTED" | "CANCEL";
  stadium: string;
  roundCode?: string;
  seriesGameNo?: number;
  seriesOutcome?: { home: number; draw: number; away: number };
}

export interface ScoreEntry {
  gameId: string;
  date: string;
  time: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: "home" | "away" | null;
  status: "result" | "upcoming" | "live" | "cancel";
  stadium: string;
  roundCode: string;
  roundName: string;
  seriesGameNo: number | null;
  seriesOutcome: { home: number; away: number } | null;
}

async function fetchScores(): Promise<NaverGame[]> {
  const res = await fetch(NAVER_SCORES_URL(SEASON_FROM, SEASON_TO), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://m.sports.naver.com/basketball/schedule/index?category=kbl",
      "X-Sports-Backend": "kotlin",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return (json?.result?.games ?? []) as NaverGame[];
}

function toEntry(g: NaverGame): ScoreEntry {
  const dt = new Date(g.gameDateTime);
  const time = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;

  const statusMap: Record<NaverGame["statusCode"], ScoreEntry["status"]> = {
    RESULT: "result",
    BEFORE: "upcoming",
    STARTED: "live",
    CANCEL: "cancel",
  };

  const winner =
    g.winner === "HOME" ? "home" :
    g.winner === "AWAY" ? "away" : null;

  const roundCode = g.roundCode ?? "kbl_r";

  return {
    gameId: g.gameId,
    date: g.gameDate,
    time,
    home: toShort(g.homeTeamName),
    away: toShort(g.awayTeamName),
    homeScore: g.homeTeamScore ?? null,
    awayScore: g.awayTeamScore ?? null,
    winner,
    status: statusMap[g.statusCode] ?? "upcoming",
    stadium: g.stadium,
    roundCode,
    roundName: ROUND_CODE_MAP[roundCode] ?? roundCode,
    seriesGameNo: g.seriesGameNo ?? null,
    seriesOutcome: g.seriesOutcome
      ? { home: g.seriesOutcome.home, away: g.seriesOutcome.away }
      : null,
  };
}

async function main() {
  console.log("🏀 네이버 스포츠 KBL 스코어 수집 시작\n");

  const games = await fetchScores();
  console.log(`전체 경기: ${games.length}건`);

  const entries = games.map(toEntry);

  const results = entries.filter((e) => e.status === "result");
  const upcoming = entries.filter((e) => e.status === "upcoming");
  const live = entries.filter((e) => e.status === "live");

  console.log(`  완료: ${results.length}건 / 예정: ${upcoming.length}건 / 진행중: ${live.length}건`);

  // 플레이오프 경기 표시
  const playoff = entries.filter((e) => e.roundCode !== "kbl_r" && e.roundCode !== "kbl_ir");
  if (playoff.length > 0) {
    console.log(`\n플레이오프 경기 (${playoff.length}건):`);
    for (const e of playoff) {
      const score = e.status === "result" ? `${e.homeScore}:${e.awayScore}` : "예정";
      const winner = e.winner === "home" ? e.home : e.winner === "away" ? e.away : "";
      const series = e.seriesOutcome ? `(시리즈 ${e.seriesOutcome.home}-${e.seriesOutcome.away})` : "";
      console.log(`  ${e.date} ${e.time} | ${e.home} ${score} ${e.away} ${winner ? `→ ${winner} 승` : ""} | ${e.roundName} ${e.seriesGameNo ?? ""}차전 ${series}`);
    }
  }

  if (results.length > 0) {
    console.log("\n최근 결과 (최신 5건):");
    [...results].reverse().slice(0, 5).forEach((e) => {
      const winner = e.winner === "home" ? e.home : e.away;
      console.log(`  ${e.date} ${e.home} ${e.homeScore ?? "-"} : ${e.awayScore ?? "-"} ${e.away}  → ${winner} 승`);
    });
  }

  const dataDir = process.env.KBL_DATA_DIR ?? "data/kbl";
  await fs.mkdir(path.resolve(process.cwd(), dataDir), { recursive: true });
  const outputPath = path.resolve(process.cwd(), `${dataDir}/scores.json`);
  await fs.writeFile(outputPath, JSON.stringify(entries, null, 2), "utf-8");
  console.log(`\n✅ 저장 완료 → ${outputPath}`);
}

main().catch(console.error);
