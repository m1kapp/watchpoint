/**
 * KBL 선수 데이터 크롤러 (Naver Sports 게임 기록 API 기반)
 *
 * 실행: npx tsx scripts/scrape/kbl/players.ts
 * 출력: data/kbl/players.json (통합 포맷)
 *
 * 전략:
 *   1. 시즌 전체 경기 박스스코어에서 선수별 누적 스탯 계산
 *   2. 통합 포맷으로 출력 (바이오 데이터는 bio.ts에서 보강)
 */

import fs from "fs/promises";
import path from "path";
import { CURRENT_SEASON, NAVER_SCORES_URL, SEASON_FROM, SEASON_TO } from "./constants";
import teamsJson from "../../../data/kbl/teams.json" with { type: "json" };

const NAVER_GAME_RECORD_URL = (gameId: string) =>
  `https://api-gw.sports.naver.com/schedule/games/${gameId}/record`;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Referer: "https://m.sports.naver.com/",
  "X-Sports-Backend": "kotlin",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// naverCode → 팀 정보
const CODE_TO_TEAM = Object.fromEntries(teamsJson.map((t) => [t.naverCode, t]));

// ─── 타입 ────────────────────────────────────────────────────────────────────

interface NaverPlayerStat {
  playerId: string;
  playerName: string;
  playerShortName: string;
  backNum: string;
  position: string;
  teamCode: string;
  startFlag: boolean;
  playTimeSec: number;
  playTimeStr: string;
  scoreTot: number;
  reboundTot: number;
  as: number;
  st: number;
  bs: number;
  to: number;
  fg: number;
  fgA: number;
  fgP: number;
  threeP: number;
  threePA: number;
  threePP: number;
  ft: number;
  ftA: number;
  ftP: number;
  or: number;
  dr: number;
  foulTot: number;
}

// ─── 통합 포맷 출력 타입 ─────────────────────────────────────────────────────

interface UnifiedPlayer {
  pno: string;
  teamId: string;
  teamName: string;
  name: string;
  nameEn: string | null;
  number: number | null;
  position: string;
  height: string | null;
  weight: string | null;
  birthDate: string | null;
  birthYear: number | null;
  school: string | null;
  draftYear: number | null;
  draftRound: number | null;
  draftPick: number | null;
  imageUrl: string;
  tags: string[];
  career_seasons: {
    season: string;
    team: string;
    games: number;
    points: number;
    rebounds: number;
    assists: number;
    spg: number;
    bpg: number;
    fgPct: number;
    threePct: number;
    ftPct: number;
    mpg: number;
  }[];
}

// ─── 경기 기록에서 선수 정보 추출 ───────────────────────────────────────────

async function fetchGamePlayers(gameId: string): Promise<NaverPlayerStat[]> {
  const res = await fetch(NAVER_GAME_RECORD_URL(gameId), { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for game ${gameId}`);
  const json = await res.json();
  const record = json?.result?.recordData;
  if (!record) return [];

  const home = (record.homePlayerStats ?? []) as NaverPlayerStat[];
  const away = (record.awayPlayerStats ?? []) as NaverPlayerStat[];
  return [...home, ...away];
}

// ─── 시즌 전체 경기에서 누적 스탯 계산 ──────────────────────────────────────

interface PlayerAccum {
  playerId: string;
  name: string;
  number: string;
  position: string;
  teamCode: string;
  games: number;
  totalPts: number;
  totalReb: number;
  totalAst: number;
  totalStl: number;
  totalBlk: number;
  totalFg: number;
  totalFgA: number;
  total3p: number;
  total3pA: number;
  totalFt: number;
  totalFtA: number;
  totalMin: number;
}

async function buildSeasonStats(): Promise<Map<string, PlayerAccum>> {
  console.log("── 시즌 전체 경기 스탯 집계 ──");

  const res = await fetch(NAVER_SCORES_URL(SEASON_FROM, SEASON_TO), { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const games = (json?.result?.games ?? []) as any[];

  const resultGames = games.filter((g: any) =>
    g.statusCode === "RESULT" &&
    (g.roundCode === "kbl_r" || g.roundCode?.startsWith("kbl_ps"))
  );

  console.log(`  정규시즌+플레이오프 완료 경기: ${resultGames.length}건`);

  const accum = new Map<string, PlayerAccum>();
  let processed = 0;

  for (const g of resultGames) {
    try {
      const players = await fetchGamePlayers(g.gameId);
      for (const p of players) {
        if (p.playTimeSec === 0 && p.scoreTot === 0) continue; // 미출전

        const key = `${p.teamCode}-${p.playerId}`;
        let a = accum.get(key);
        if (!a) {
          a = {
            playerId: p.playerId,
            name: p.playerName,
            number: p.backNum,
            position: p.position,
            teamCode: p.teamCode,
            games: 0,
            totalPts: 0, totalReb: 0, totalAst: 0, totalStl: 0, totalBlk: 0,
            totalFg: 0, totalFgA: 0, total3p: 0, total3pA: 0, totalFt: 0, totalFtA: 0,
            totalMin: 0,
          };
          accum.set(key, a);
        }
        a.games++;
        a.totalPts += p.scoreTot;
        a.totalReb += p.reboundTot;
        a.totalAst += p.as;
        a.totalStl += p.st;
        a.totalBlk += p.bs;
        a.totalFg += p.fg;
        a.totalFgA += p.fgA;
        a.total3p += p.threeP;
        a.total3pA += p.threePA;
        a.totalFt += p.ft;
        a.totalFtA += p.ftA;
        a.totalMin += p.playTimeSec / 60;
      }
      processed++;
      if (processed % 20 === 0) {
        process.stdout.write(`  ${processed}/${resultGames.length} 경기 처리...\r`);
      }
    } catch (e) {
      // skip failed games
    }
    await sleep(100);
  }

  console.log(`  ${processed}/${resultGames.length} 경기 처리 완료, ${accum.size}명 선수`);
  return accum;
}

// ─── 포지션 매핑 ─────────────────────────────────────────────────────────────

const POS_MAP: Record<string, string> = {
  G: "PG", PG: "PG", SG: "SG",
  GF: "SG", F: "SF", SF: "SF",
  PF: "PF", FC: "PF", FD: "PF",
  C: "C",
};

// ─── 메인 ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏀 KBL 선수 데이터 수집 시작\n");

  // 기존 데이터 로드 (바이오 데이터 보존)
  const dataDir = process.env.KBL_DATA_DIR ?? "data/kbl";
  const outputPath = path.resolve(process.cwd(), `${dataDir}/players.json`);
  let existingMap = new Map<string, any>();
  try {
    const existing = JSON.parse(await fs.readFile(outputPath, "utf-8")) as any[];
    existingMap = new Map(existing.map((p) => [p.pno, p]));
    console.log(`  기존 데이터: ${existingMap.size}명 (바이오 보존)\n`);
  } catch {
    console.log("  기존 데이터 없음 — 새로 생성\n");
  }

  const accum = await buildSeasonStats();

  // PlayerAccum → UnifiedPlayer 변환
  const players: UnifiedPlayer[] = [];

  for (const a of accum.values()) {
    const team = CODE_TO_TEAM[a.teamCode];
    if (!team) continue;

    const g = a.games;
    const existing = existingMap.get(a.playerId);

    players.push({
      pno: a.playerId,
      teamId: team.teamId,
      teamName: team.teamName,
      name: a.name,
      nameEn: existing?.nameEn ?? null,
      number: parseInt(a.number) || null,
      position: POS_MAP[a.position] ?? a.position,
      height: existing?.height ?? null,
      weight: existing?.weight ?? null,
      birthDate: existing?.birthDate ?? null,
      birthYear: existing?.birthYear ?? null,
      school: existing?.school ?? null,
      draftYear: existing?.draftYear ?? null,
      draftRound: existing?.draftRound ?? null,
      draftPick: existing?.draftPick ?? null,
      imageUrl: `https://kbl.or.kr/files/kbl/players-photo/${a.playerId}.png`,
      tags: existing?.tags ?? [],
      career_seasons: g > 0 ? [{
        season: CURRENT_SEASON,
        team: team.shortName,
        games: g,
        points: round(a.totalPts / g),
        rebounds: round(a.totalReb / g),
        assists: round(a.totalAst / g),
        spg: round(a.totalStl / g),
        bpg: round(a.totalBlk / g),
        fgPct: a.totalFgA > 0 ? round((a.totalFg / a.totalFgA) * 100) : 0,
        threePct: a.total3pA > 0 ? round((a.total3p / a.total3pA) * 100) : 0,
        ftPct: a.totalFtA > 0 ? round((a.totalFt / a.totalFtA) * 100) : 0,
        mpg: round(a.totalMin / g),
      }] : [],
    });
  }

  // 팀별 → PPG 순 정렬
  players.sort((a, b) => {
    if (a.teamId !== b.teamId) return a.teamId.localeCompare(b.teamId);
    return (b.career_seasons[0]?.points ?? 0) - (a.career_seasons[0]?.points ?? 0);
  });

  await fs.mkdir(path.resolve(process.cwd(), dataDir), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(players, null, 2), "utf-8");

  console.log(`\n✅ ${players.length}명 저장 → ${outputPath}`);

  // 팀별 요약
  const byTeam: Record<string, number> = {};
  for (const p of players) byTeam[p.teamName] = (byTeam[p.teamName] ?? 0) + 1;
  console.log("팀별:", byTeam);

  // 바이오 보강 현황
  const withBio = players.filter((p) => p.height || p.birthDate);
  console.log(`\n바이오 데이터: ${withBio.length}/${players.length}명`);
  if (withBio.length < players.length) {
    console.log("  → npx tsx scripts/scrape/kbl/bio.ts 로 보강 가능");
  }

  // 상위 득점자
  console.log("\n상위 득점자:");
  [...players]
    .filter((p) => (p.career_seasons[0]?.games ?? 0) >= 10)
    .sort((a, b) => (b.career_seasons[0]?.points ?? 0) - (a.career_seasons[0]?.points ?? 0))
    .slice(0, 10)
    .forEach((p) => {
      const s = p.career_seasons[0]!;
      console.log(`  ${p.name.padEnd(8)} ${p.career_seasons[0]?.team?.padEnd(6) ?? ""} ${s.points}ppg ${s.rebounds}rpg ${s.assists}apg (${s.games}G)`);
    });
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

main().catch(console.error);
