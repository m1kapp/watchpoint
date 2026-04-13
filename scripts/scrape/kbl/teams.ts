/**
 * KBL 팀 메타데이터 수집 (Naver Sports API 기반)
 *
 * 실행: npx tsx scripts/scrape/kbl/teams.ts
 * 출력: data/kbl/teams.json
 */

import fs from "fs/promises";
import path from "path";
import { NAVER_SCORES_URL, NAVER_EMBLEM_URL, SEASON_FROM, SEASON_TO } from "./constants";

// ─── 팀 ID 매핑 (네이버 팀명 → 내부 teamId + 메타) ────────────────────────────

interface TeamMeta {
  teamId: string;
  fullName: string;
  shortName: string;
  stadium: string;
}

const TEAM_META: Record<string, TeamMeta> = {
  "고양 소노":       { teamId: "sono",    fullName: "고양 소노 스카이거너스",  shortName: "소노",      stadium: "고양소노아레나" },
  "원주 DB":         { teamId: "db",      fullName: "원주 DB 프로미",          shortName: "DB",        stadium: "원주DB프로미아레나" },
  "서울 SK":         { teamId: "sk",      fullName: "서울 SK 나이츠",          shortName: "SK",        stadium: "잠실학생체육관" },
  "울산 현대모비스":  { teamId: "mobis",   fullName: "울산 현대모비스 피버스",   shortName: "모비스",    stadium: "울산동천체육관" },
  "수원 KT":         { teamId: "kt",      fullName: "수원 KT 소닉붐",          shortName: "KT",        stadium: "수원 KT 소닉붐 아레나" },
  "창원 LG":         { teamId: "lg",      fullName: "창원 LG 세이커스",        shortName: "LG",        stadium: "창원체육관" },
  "안양 정관장":     { teamId: "jkj",     fullName: "안양 정관장 레드부스터스", shortName: "정관장",    stadium: "안양 정관장 아레나" },
  "부산 KCC":        { teamId: "kcc",     fullName: "부산 KCC 이지스",         shortName: "KCC",       stadium: "부산사직체육관" },
  "서울 삼성":       { teamId: "samsungm", fullName: "서울 삼성 썬더스",        shortName: "삼성",      stadium: "잠실실내체육관" },
  "대구 한국가스공사": { teamId: "gas",    fullName: "대구 한국가스공사 페가수스", shortName: "가스공사", stadium: "대구체육관" },
};

interface NaverGame {
  homeTeamName: string;
  awayTeamName: string;
  homeTeamCode: string;
  awayTeamCode: string;
}

async function fetchNaverData(): Promise<NaverGame[]> {
  const res = await fetch(NAVER_SCORES_URL(SEASON_FROM, SEASON_TO), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: "https://m.sports.naver.com/basketball/schedule/index?category=kbl",
      "X-Sports-Backend": "kotlin",
    },
  });
  if (!res.ok) throw new Error(`Naver API HTTP ${res.status}`);
  const json = await res.json();
  return (json?.result?.games ?? []) as NaverGame[];
}

async function main() {
  console.log("🏀 KBL 팀 메타 수집 시작\n");

  const games = await fetchNaverData();

  // 네이버 팀명 → 팀코드 매핑 수집
  const naverCodeMap = new Map<string, string>();
  for (const g of games) {
    if (g.homeTeamName && g.homeTeamCode) naverCodeMap.set(g.homeTeamName, g.homeTeamCode);
    if (g.awayTeamName && g.awayTeamCode) naverCodeMap.set(g.awayTeamName, g.awayTeamCode);
  }

  const result = Object.entries(TEAM_META).map(([naverName, meta]) => {
    const naverCode = naverCodeMap.get(naverName) ?? "";
    return {
      teamId: meta.teamId,
      naverCode,
      naverName,
      teamName: meta.fullName,
      shortName: meta.shortName,
      stadium: meta.stadium,
      emblemUrl: naverCode ? NAVER_EMBLEM_URL(naverCode) : "",
    };
  });

  const dataDir = process.env.KBL_DATA_DIR ?? "data/kbl";
  await fs.mkdir(path.resolve(process.cwd(), dataDir), { recursive: true });
  const outputPath = path.resolve(process.cwd(), `${dataDir}/teams.json`);
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");

  console.log(`✅ teams.json 저장 완료 (${result.length}팀):`);
  result.forEach((t) =>
    console.log(`  ${t.teamId} | naver=${t.naverName} (code=${t.naverCode}) | ${t.teamName}`)
  );
}

main().catch(console.error);
