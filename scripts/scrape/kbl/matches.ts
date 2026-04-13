/**
 * KBL 플레이오프 일정 크롤러 (Naver Sports API 기반)
 *
 * 실행: npx tsx scripts/scrape/kbl/matches.ts
 * 출력: data/kbl/matches.json
 *
 * WKBL과 달리 공식 사이트 크롤 없이 Naver API만으로 플레이오프 데이터 수집
 */

import fs from "fs/promises";
import path from "path";
import { NAVER_SCORES_URL, ROUND_CODE_MAP, SEASON_FROM, SEASON_TO } from "./constants";
import teamsJson from "../../../data/kbl/teams.json" with { type: "json" };

// naverName → 팀 정보
const NAVER_NAME_MAP = Object.fromEntries(teamsJson.map((t) => [t.naverName, t]));

// teamId → stadium
const HOME_STADIUM = Object.fromEntries(teamsJson.map((t) => [t.teamId, t.stadium]));

interface NaverGame {
  gameId: string;
  gameDate: string;
  gameDateTime: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  winner: "HOME" | "AWAY" | "DRAW" | null;
  statusCode: "RESULT" | "BEFORE" | "STARTED" | "CANCEL";
  stadium: string;
  roundCode?: string;
  seriesGameNo?: number;
  seriesOutcome?: { home: number; draw: number; away: number };
}

function naverNameToTeamId(naverName: string): string | null {
  return NAVER_NAME_MAP[naverName]?.teamId ?? null;
}

function buildStage(roundCode: string, seriesGameNo: number | null, homeTeam: string, awayTeam: string): string {
  const roundName = ROUND_CODE_MAP[roundCode] ?? roundCode;
  const homeShort = NAVER_NAME_MAP[homeTeam]?.shortName ?? homeTeam;
  const awayShort = NAVER_NAME_MAP[awayTeam]?.shortName ?? awayTeam;

  if (seriesGameNo) {
    return `${roundName} ${seriesGameNo}차전 (${homeShort}·${awayShort})`;
  }
  return roundName;
}

// date + 양팀 조합(순서 무관) → 유일 키
function makeKey(a: string, b: string, date: string) {
  return `${date}|${[a, b].sort().join("|")}`;
}

async function main() {
  console.log("🏀 KBL 플레이오프 일정 수집 시작\n");

  const dataDir = process.env.KBL_DATA_DIR ?? "data/kbl";
  await fs.mkdir(path.resolve(process.cwd(), dataDir), { recursive: true });
  const outputPath = path.resolve(process.cwd(), `${dataDir}/matches.json`);

  // 기존 JSON 읽기 (에디토리얼 데이터 보존)
  const existingRaw = await fs.readFile(outputPath, "utf-8").catch(() => "[]");
  const existing: any[] = JSON.parse(existingRaw);

  // Naver API 호출
  const res = await fetch(NAVER_SCORES_URL(SEASON_FROM, SEASON_TO), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://m.sports.naver.com/basketball/schedule/index?category=kbl",
      "X-Sports-Backend": "kotlin",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const games = (json?.result?.games ?? []) as NaverGame[];

  // 플레이오프 경기만 필터
  const playoffGames = games.filter(
    (g) => g.roundCode && g.roundCode !== "kbl_r" && g.roundCode !== "kbl_ir"
  );

  console.log(`발견된 플레이오프 경기: ${playoffGames.length}건\n`);

  // 기존 항목 인덱스 맵
  const existingMap = new Map<string, any>(
    existing.map((e) => [makeKey(e.leftTeamId ?? "", e.rightTeamId ?? "", e.date ?? ""), e])
  );

  let updated = 0, added = 0;

  for (const g of playoffGames) {
    const leftTeamId = naverNameToTeamId(g.homeTeamName);
    const rightTeamId = naverNameToTeamId(g.awayTeamName);
    const date = g.gameDate;
    const dt = new Date(g.gameDateTime);
    const time = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    const isFinished = g.statusCode === "RESULT";
    const leftScore = isFinished ? (g.homeTeamScore ?? null) : null;
    const rightScore = isFinished ? (g.awayTeamScore ?? null) : null;

    // "미정" 팀 건너뛰기 (아직 확정되지 않은 경기)
    if (!leftTeamId && g.homeTeamName === "미정") continue;
    if (!rightTeamId && g.awayTeamName === "미정") continue;

    // leftTeamId가 null인 경우 (매핑 실패) — naverName 직접 사용
    const lid = leftTeamId ?? g.homeTeamName;
    const rid = rightTeamId ?? g.awayTeamName;

    const stage = buildStage(g.roundCode!, g.seriesGameNo ?? null, g.homeTeamName, g.awayTeamName);
    const location = g.stadium || null;

    const key = makeKey(lid, rid, date);
    const entry = existingMap.get(key);

    if (entry) {
      // 스크래퍼 필드만 업데이트 (에디토리얼 필드 보존)
      entry.leftScore = leftScore;
      entry.rightScore = rightScore;
      entry.isFinished = isFinished;
      entry.time = time;
      entry.stage = stage;
      entry.location = location;
      entry.gameId = g.gameId;
      entry.seriesGameNo = g.seriesGameNo ?? null;
      entry.seriesOutcome = g.seriesOutcome
        ? { home: g.seriesOutcome.home, away: g.seriesOutcome.away }
        : null;
      updated++;
    } else {
      // 자동 생성 ID: 날짜 + 팀 조합 해시
      const autoId = `kbl-${date.replace(/-/g, "")}-${lid}-${rid}`;
      existing.push({
        id: autoId,
        stage,
        date,
        time,
        location,
        leftTeamId: lid,
        rightTeamId: rid,
        leftScore,
        rightScore,
        isFinished,
        gameId: g.gameId,
        roundCode: g.roundCode,
        seriesGameNo: g.seriesGameNo ?? null,
        seriesOutcome: g.seriesOutcome
          ? { home: g.seriesOutcome.home, away: g.seriesOutcome.away }
          : null,
        teams: [],
        coaches: [],
        players: [],
      });
      existingMap.set(key, existing[existing.length - 1]);
      added++;
    }

    const score = isFinished ? `${leftScore ?? "-"}:${rightScore ?? "-"}` : "예정";
    const winner = isFinished && leftScore != null && rightScore != null
      ? (leftScore > rightScore ? `${g.homeTeamName} 승` : `${g.awayTeamName} 승`)
      : "";
    console.log(`  ${date} ${time} | ${g.homeTeamName} vs ${g.awayTeamName} | ${score} ${winner} | ${stage}`);
  }

  // 날짜순 정렬
  existing.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  await fs.writeFile(outputPath, JSON.stringify(existing, null, 2), "utf-8");
  console.log(`\n✅ 저장 완료 → ${outputPath} (갱신 ${updated}건, 신규 ${added}건)`);
}

main().catch(console.error);
