import type { MatchData, MatchInfo } from "./match-types";
import { TEAMS } from "./data";
import wkblMatchesJson from "../../data/wkbl/matches.json";
import kblMatchesJson from "../../data/kbl/matches.json";

// ─── Raw JSON 타입 ──────────────────────────────────────────────

interface RawMatchJson {
  id?: string;
  stage: string;
  date: string;
  time: string;
  location?: string;
  leftTeamId: string;
  rightTeamId: string;
  leftScore?: number | null;
  rightScore?: number | null;
  teams?: MatchData["teams"];
  coaches?: MatchData["coaches"];
  players?: MatchData["players"];
  cancelled?: boolean;
  cancelReason?: string | null;
}

// ─── 변환 ───────────────────────────────────────────────────────

const ID_TO_SHORT = Object.fromEntries(TEAMS.map((t) => [t.id, t.shortName]));

function toMatchData(m: RawMatchJson, league: MatchInfo["league"]): (MatchData & { id: string }) | null {
  if (!m.id) return null;
  return {
    id: m.id,
    match: {
      date: m.date,
      time: m.time,
      location: m.location ?? "",
      stage: m.stage,
      home: ID_TO_SHORT[m.leftTeamId] ?? m.leftTeamId,
      away: ID_TO_SHORT[m.rightTeamId] ?? m.rightTeamId,
      league,
      score:
        m.leftScore != null && m.rightScore != null
          ? { home: m.leftScore, away: m.rightScore }
          : undefined,
    },
    teams: m.teams ?? [],
    coaches: m.coaches ?? [],
    players: m.players ?? [],
    cancelled: m.cancelled || undefined,
    cancelReason: m.cancelReason ?? undefined,
  };
}

// ─── 매치 데이터 ────────────────────────────────────────────────

const wkblMatches = (wkblMatchesJson as RawMatchJson[]).map((m) => toMatchData(m, "WKBL")).filter(Boolean) as (MatchData & { id: string })[];
const kblMatches = (kblMatchesJson as RawMatchJson[]).map((m) => toMatchData(m, "KBL")).filter(Boolean) as (MatchData & { id: string })[];

export const MATCHES: (MatchData & { id: string })[] = [...wkblMatches, ...kblMatches]
  .sort((a, b) => a.match.date.localeCompare(b.match.date));

export const WKBL_MATCHES = wkblMatches;
export const KBL_MATCHES = kblMatches;

// ─── 룩업 ───────────────────────────────────────────────────────

const MATCH_MAP = new Map(MATCHES.map((m) => [m.id, m]));

export function getMatchById(id: string) {
  return MATCH_MAP.get(id) ?? null;
}
