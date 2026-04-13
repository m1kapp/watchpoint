/**
 * players.json → data.ts PLAYERS 업데이트
 *
 * 실행: npx tsx scripts/generate/apply-players.ts
 *
 * - 크롤링된 실제 데이터로 PLAYERS 배열 교체
 * - 기존 data.ts의 tags는 이름 매칭으로 보존
 * - imageUrl은 WKBL 공식 URL로 교체
 * - TEAMS 섹션은 건드리지 않음
 */

import fs from "fs/promises";
import path from "path";
import playersJson from "../../data/wkbl/players.json" with { type: "json" };
import nationalTeamJson from "../../data/wkbl/national-team.json" with { type: "json" };
import teamsJson from "../../data/wkbl/teams.json" with { type: "json" };

// current: true인 가장 최근 대회 엔트리 사용
const currentRoster = nationalTeamJson.rosters.find((r) => r.current)?.players ?? [];
const NATIONAL_TEAM = Object.fromEntries(
  currentRoster.map((p) => [`${p.name}:${p.pno}`, "A대표팀" as "A대표팀" | "국가대표 후보"])
);

const CURRENT_YEAR = 2026;
const DATA_TS_PATH = path.resolve(process.cwd(), "src/lib/data.ts");

// ─── Player 객체 → TS 코드 문자열 ───────────────────────────────────────────

function buildCareerSeasons(p: (typeof playersJson)[0]): string {
  const seasons = (p as any).career_seasons as any[] | undefined;
  if (!seasons?.length) return "";
  return `\n    career_seasons: ${JSON.stringify(seasons)},`;
}

function playerToTs(p: (typeof playersJson)[0], tags: string[]): string {
  const birthYear = p.birthYear ?? CURRENT_YEAR - 25;
  const age = CURRENT_YEAR - birthYear;
  const careerYear = p.draftYear ? CURRENT_YEAR - p.draftYear : 1;
  const tagsStr =
    tags.length > 0 ? tags.map((t) => `"${t}"`).join(", ") : "";

  const natKey = `${p.name}:${p.pno}`;
  const natLevel = NATIONAL_TEAM[natKey] ?? null;
  const isNational = natLevel !== null;
  const natLevelStr = natLevel ?? "없음";

  return `  {
    id: "${p.teamId}-${p.pno}",
    name: "${p.name}",
    number: ${p.number ?? 0},
    position: "${p.position ?? "SF"}",
    height: "${p.height ?? ""}",
    team: "${p.teamName}",
    teamId: "${p.teamId}",
    imageUrl: "${p.imageUrl}",
    bio: {
      birth_year: ${birthYear},
      age: ${age},
      career_year: ${careerYear},
      national_team: { is_national: ${isNational}, level: "${natLevelStr}" },
    },
    tags: [${tagsStr}],${p.draftYear != null ? `
    draft: { year: ${p.draftYear}, round: ${p.draftRound ?? 1}, pick: ${p.draftPick ?? 0} },` : ""}${buildCareerSeasons(p)}${(p as any).career_highlights?.length ? `
    career_highlights: ${JSON.stringify((p as any).career_highlights)},` : ""}
  }`;
}

// ─── 팀 순서 (teams.json 순서 그대로) ───────────────────────────────────────

const TEAM_ORDER = teamsJson.map((t) => t.teamId);
const TEAM_LABELS = Object.fromEntries(teamsJson.map((t) => [t.teamId, t.teamName]));

// ─── 메인 ────────────────────────────────────────────────────────────────────

async function main() {
  const source = await fs.readFile(DATA_TS_PATH, "utf-8");

  // 팀별로 그룹 + 정렬 (등번호 순)
  const byTeam = new Map<string, typeof playersJson>();
  for (const t of TEAM_ORDER) byTeam.set(t, []);
  for (const p of playersJson) {
    const arr = byTeam.get(p.teamId) ?? [];
    arr.push(p);
    byTeam.set(p.teamId, arr);
  }
  for (const arr of byTeam.values()) {
    arr.sort((a, b) => (a.number ?? 99) - (b.number ?? 99));
  }

  // PLAYERS 블록 생성
  const playerLines: string[] = [];
  for (const teamId of TEAM_ORDER) {
    const players = byTeam.get(teamId) ?? [];
    if (!players.length) continue;
    playerLines.push(`  // ─── ${TEAM_LABELS[teamId]} ${"─".repeat(40 - TEAM_LABELS[teamId].length)}`);
    for (const p of players) {
      const tags: string[] = (p as any).tags ?? [];
      playerLines.push(playerToTs(p, tags));
    }
  }

  const playersBlock = `export const PLAYERS: Player[] = [\n${playerLines.join(",\n")},\n];`;

  // data.ts에서 PLAYERS 블록만 교체 (TEAMS + TAG_COLORS 보존)
  const playersStart = source.indexOf("export const PLAYERS");
  if (playersStart === -1) {
    console.error("❌ data.ts에서 PLAYERS를 찾지 못했어요");
    process.exit(1);
  }

  // PLAYERS 블록 끝 찾기: 최상위 ]; 패턴
  const afterPlayers = source.indexOf("\nexport const", playersStart + 1);
  const tail = afterPlayers !== -1 ? "\n" + source.slice(afterPlayers + 1) : "\n";

  const header = source.slice(0, playersStart);
  const newSource = header + playersBlock + "\n" + tail;

  // ── 검증: 생성된 소스가 올바른 구조인지 확인 ──
  if (!newSource.includes("export const PLAYERS") || !newSource.includes("export const TEAMS")) {
    console.error("❌ 생성된 소스에 필수 export가 누락됨 — 파일을 덮어쓰지 않습니다");
    process.exit(1);
  }
  if (newSource.length < source.length * 0.5) {
    console.error(`❌ 생성된 소스 크기(${newSource.length})가 원본(${source.length})의 50% 미만 — 비정상 축소 감지`);
    process.exit(1);
  }

  // ── 백업 후 덮어쓰기 ──
  const backupPath = DATA_TS_PATH + ".bak";
  await fs.writeFile(backupPath, source, "utf-8");
  await fs.writeFile(DATA_TS_PATH, newSource, "utf-8");
  console.log(`\n✅ data.ts PLAYERS 업데이트 완료 (${playersJson.length}명)`);
  console.log(`   백업: ${backupPath}`);
}

main().catch(console.error);
