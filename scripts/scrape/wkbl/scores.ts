/**
 * 네이버 스포츠 WKBL 경기 결과 크롤러
 *
 * 실행: npx tsx scripts/scrape/naver-scores.ts
 * 출력: data/wkbl/scores.json
 *
 * 소스: https://api-gw.sports.naver.com/schedule/games
 *   - 공개 JSON API (별도 인증 불필요)
 *   - 스코어, 경기상태(RESULT/BEFORE/STARTED), 경기일시 포함
 */

import fs from "fs/promises";
import path from "path";

const API_URL = "https://api-gw.sports.naver.com/schedule/games";
const SEASON_FROM = "2025-10-01";
const SEASON_TO   = "2026-06-30";

interface NaverGame {
  gameId: string;
  gameDate: string;           // "2026-04-08"
  gameDateTime: string;       // "2026-04-08T19:00:00"
  homeTeamName: string;
  awayTeamName: string;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  winner: "HOME" | "AWAY" | "DRAW" | null;
  statusCode: "RESULT" | "BEFORE" | "STARTED" | "CANCEL";
  stadium: string;
  roundCode?: string;
  seriesGameNo?: number;
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
}

async function fetchScores(): Promise<NaverGame[]> {
  const params = new URLSearchParams({
    fields:          "basic,schedule",
    superCategoryId: "basketball",
    categoryId:      "wkbl",
    fromDate:        SEASON_FROM,
    toDate:          SEASON_TO,
    size:            "500",
  });

  const res = await fetch(`${API_URL}?${params}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Referer":    "https://m.sports.naver.com/basketball/schedule/index?category=wkbl",
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
    RESULT:  "result",
    BEFORE:  "upcoming",
    STARTED: "live",
    CANCEL:  "cancel",
  };

  const winner =
    g.winner === "HOME" ? "home" :
    g.winner === "AWAY" ? "away" : null;

  return {
    gameId:    g.gameId,
    date:      g.gameDate,
    time,
    home:      g.homeTeamName,
    away:      g.awayTeamName,
    homeScore: g.homeTeamScore ?? null,
    awayScore: g.awayTeamScore ?? null,
    winner,
    status:    statusMap[g.statusCode] ?? "upcoming",
    stadium:   g.stadium,
  };
}

async function main() {
  console.log("🏀 네이버 스포츠 WKBL 스코어 수집 시작\n");

  const games = await fetchScores();
  console.log(`전체 경기: ${games.length}건`);

  const entries = games.map(toEntry);

  const results  = entries.filter((e) => e.status === "result");
  const upcoming = entries.filter((e) => e.status === "upcoming");
  const live     = entries.filter((e) => e.status === "live");

  console.log(`  완료: ${results.length}건 / 예정: ${upcoming.length}건 / 진행중: ${live.length}건`);

  if (results.length > 0) {
    console.log("\n최근 결과 (최신 5건):");
    [...results].reverse().slice(0, 5).forEach((e) => {
      const winner = e.winner === "home" ? e.home : e.away;
      console.log(`  ${e.date} ${e.home} ${e.homeScore ?? "-"} : ${e.awayScore ?? "-"} ${e.away}  → ${winner} 승`);
    });
  }

  const dataDir = process.env.WKBL_DATA_DIR ?? "data/wkbl";
  await fs.mkdir(path.resolve(process.cwd(), dataDir), { recursive: true });
  const outputPath = path.resolve(process.cwd(), `${dataDir}/scores.json`);
  await fs.writeFile(outputPath, JSON.stringify(entries, null, 2), "utf-8");
  console.log(`\n✅ 저장 완료 → ${outputPath}`);
}

main().catch(console.error);
