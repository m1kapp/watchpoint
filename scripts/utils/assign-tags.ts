/**
 * 시즌 스탯 기반 자동 태그 부여
 *
 * 실행: npx tsx scripts/generate/assign-tags.ts
 * → src/lib/generated/players.json 업데이트 (tags 필드 추가)
 * → 이후 npm run generate:players 로 data.ts 반영
 */

import fs from "fs/promises";
import path from "path";
import wkblNationalTeamJson from "../../data/wkbl/national-team.json" with { type: "json" };
import kblNationalTeamJson from "../../data/kbl/national-team.json" with { type: "json" };
import wkblAwardsJson from "../../data/wkbl/awards.json" with { type: "json" };
import kblAwardsJson from "../../data/kbl/awards.json" with { type: "json" };

function buildNationalTeamSet(...jsons: any[]) {
  const map: Record<string, "A대표팀" | "국가대표 후보"> = {};
  for (const json of jsons) {
    const roster = json.rosters?.find((r: any) => r.current)?.players ?? [];
    for (const p of roster) {
      map[`${p.name}:${p.pno}`] = "A대표팀";
    }
  }
  return map;
}

const NATIONAL_TEAM = buildNationalTeamSet(wkblNationalTeamJson, kblNationalTeamJson);
const MVP_PLAYERS  = new Set<string>([...wkblAwardsJson.mvp, ...kblAwardsJson.mvp]);
const ROOKIE_AWARD = new Set<string>([...wkblAwardsJson.rookieOfTheYear, ...kblAwardsJson.rookieOfTheYear]);

const WKBL_PATH = path.resolve(process.cwd(), "data/wkbl/players.json");
const KBL_PATH  = path.resolve(process.cwd(), "data/kbl/players.json");

type PlayerTag =
  | "에이스" | "1옵션" | "식스맨" | "리더"
  | "수비형" | "슈터" | "플레이메이커" | "리바운더" | "골밑 핵심"
  | "클러치" | "흐름 체인저" | "안정감" | "폭발력"
  | "국가대표" | "신인왕" | "MVP" | "베테랑";

interface CareerSeasonEntry {
  season: string;
  games: number;
  points: number;
  rebounds: number;
  assists: number;
  spg?: number | null;
  bpg?: number | null;
  fgPct?: number | null;
  threePct?: number | null;
}

interface Player {
  pno: string;
  teamId: string;
  name: string;
  position: string | null;
  height: string | null;
  career_seasons?: CareerSeasonEntry[];
  draftYear: number | null;
  birthYear: number | null;
  tags?: PlayerTag[];
}

const CURRENT_YEAR = 2026;

function assignTags(player: Player, teamPlayers: Player[]): PlayerTag[] {
  const tags = new Set<PlayerTag>();
  // 현재 시즌 스탯은 career_seasons[0]
  const s = player.career_seasons?.[0] ?? null;
  const name = player.name;
  const pos = player.position ?? "";
  const careerYear = player.draftYear ? CURRENT_YEAR - player.draftYear : 1;
  const games = s?.games ?? 0;

  const key = `${name}:${player.pno}`;

  // ── 경력 기반 ───────────────────────────────────────────────
  if (careerYear >= 10) tags.add("베테랑");
  if (MVP_PLAYERS.has(key)) tags.add("MVP");
  if (ROOKIE_AWARD.has(name)) tags.add("신인왕");

  // ── 국가대표 ─────────────────────────────────────────────────
  if (NATIONAL_TEAM[key]) tags.add("국가대표");

  // 스탯 없으면 여기서 종료
  if (!s || games < 5) return [...tags];

  const ppg   = s.points   ?? 0;
  const rpg   = s.rebounds ?? 0;
  const apg   = s.assists  ?? 0;
  const spg   = s.spg      ?? 0;
  const thPct = s.threePct ?? 0;

  // ── 팀내 순위 ─────────────────────────────────────────────────
  const teamWithStats = teamPlayers.filter(p => (p.career_seasons?.[0]?.games ?? 0) >= 5);
  const teamByPpg = [...teamWithStats].sort((a, b) => (b.career_seasons?.[0]?.points ?? 0) - (a.career_seasons?.[0]?.points ?? 0));
  const ppgRank = teamByPpg.findIndex(p => p.pno === player.pno) + 1;

  // ── 공격 역할 ──────────────────────────────────────────────────
  if (ppgRank === 1 || ppg >= 15) {
    tags.add("에이스");
  } else if (ppgRank <= 3 || ppg >= 9) {
    tags.add("1옵션");
  } else if (ppg >= 5 && games < 22) {
    tags.add("식스맨");
  }

  // ── 폭발력: 팀내 ppg top2 or 전체 상위 스코어러 ────────────────
  if (ppg >= 10) tags.add("폭발력");

  // ── 수비형 ────────────────────────────────────────────────────
  if (spg >= 1.2 && games >= 15) tags.add("수비형");

  // ── 슈터: 3점 성공률 35% 이상 (의미있는 시도) ─────────────────
  // threePct가 100이면 1/1 같은 극소 시도 → 제외
  if (thPct >= 35 && thPct < 100 && games >= 10) tags.add("슈터");

  // ── 플레이메이커: APG 3.5+ ──────────────────────────────────────
  if (apg >= 3.5) tags.add("플레이메이커");

  // ── 리바운더: RPG 6.5+ ─────────────────────────────────────────
  if (rpg >= 6.5) tags.add("리바운더");

  // ── 골밑 핵심: 빅맨 기준 ───────────────────────────────────────
  const isBig = ["C", "PF", "FC"].includes(pos);
  if (rpg >= 7.5 || (rpg >= 4.5 && isBig)) tags.add("골밑 핵심");

  // ── 안정감: 풀시즌 + 준수한 기여 ────────────────────────────────
  if (games >= 27 && ppg >= 3 && !tags.has("에이스") && !tags.has("1옵션")) {
    tags.add("안정감");
  }

  // ── 흐름 체인저: 벤치 임팩트 ──────────────────────────────────
  if (games >= 10 && games < 25 && ppg >= 4 && ppgRank > 3) {
    tags.add("흐름 체인저");
  }

  return [...tags];
}

async function processFile(filePath: string, label: string) {
  const raw = await fs.readFile(filePath, "utf-8");
  const players: Player[] = JSON.parse(raw);

  // 팀별 그룹
  const byTeam = new Map<string, Player[]>();
  for (const p of players) {
    const arr = byTeam.get(p.teamId) ?? [];
    arr.push(p);
    byTeam.set(p.teamId, arr);
  }

  let changed = 0;
  for (const p of players) {
    const team = byTeam.get(p.teamId) ?? [];
    p.tags = assignTags(p, team);
    if (p.tags.length > 0) changed++;
  }

  await fs.writeFile(filePath, JSON.stringify(players, null, 2), "utf-8");

  console.log(`✅ ${label} 태그 부여 완료: ${changed}/${players.length}명\n`);

  // 결과 미리보기
  const sorted = [...players]
    .filter(p => (p.tags?.length ?? 0) > 0)
    .sort((a, b) => (b.tags?.length ?? 0) - (a.tags?.length ?? 0));

  sorted.slice(0, 10).forEach(p => {
    console.log(`  ${p.name.padEnd(12)} [${(p.tags ?? []).join(", ")}]`);
  });

  // 태그 집계
  const counts: Record<string, number> = {};
  for (const p of players) {
    for (const t of (p.tags ?? [])) {
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  console.log("\n태그별 선수 수:", counts);
}

async function main() {
  await processFile(WKBL_PATH, "WKBL");
  console.log("\n" + "─".repeat(50) + "\n");
  await processFile(KBL_PATH, "KBL");
}

main().catch(console.error);
