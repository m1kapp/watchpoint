import type { MatchData } from "./match-types";
import { TN, TEAMS } from "./data";
import matchesJson from "../../data/wkbl/matches.json";

// teamId → shortName (TN 값)
const ID_TO_SHORT = Object.fromEntries(TEAMS.map((t) => [t.id, t.shortName]));

// matches.json → MatchData[]
export const MATCHES: (MatchData & { id: string })[] = (matchesJson as any[])
  .filter((m) => m.id)
  .map((m) => ({
    id: m.id as string,
    match: {
      date: m.date,
      time: m.time,
      location: m.location ?? "",
      stage: m.stage,
      home: ID_TO_SHORT[m.leftTeamId] ?? m.leftTeamId,
      away: ID_TO_SHORT[m.rightTeamId] ?? m.rightTeamId,
      score:
        m.leftScore != null
          ? { home: m.leftScore as number, away: m.rightScore as number }
          : undefined,
    },
    teams: (m.teams ?? []) as MatchData["teams"],
    coaches: (m.coaches ?? []) as MatchData["coaches"],
    players: (m.players ?? []) as MatchData["players"],
    cancelled: m.cancelled === true ? true : undefined,
    cancelReason: m.cancelReason as string | undefined,
  }));

export const MATCH = MATCHES[0];

// ─── 스타일 상수 (데이터 아님, 여기서만 관리) ──────────────────────────────────

export const TAG_COLORS: Record<string, string> = {
  레전드: "bg-amber-100 text-amber-700",
  에이스: "bg-red-100 text-red-700",
  "1옵션": "bg-orange-100 text-orange-700",
  식스맨: "bg-yellow-100 text-yellow-700",
  득점원: "bg-orange-100 text-orange-700",
  수비형: "bg-blue-100 text-blue-700",
  슈터: "bg-sky-100 text-sky-700",
  플레이메이커: "bg-indigo-100 text-indigo-700",
  리바운더: "bg-violet-100 text-violet-700",
  핸들러: "bg-indigo-100 text-indigo-700",
  "공격 전개": "bg-cyan-100 text-cyan-700",
  클러치: "bg-rose-100 text-rose-700",
  "흐름 체인저": "bg-pink-100 text-pink-700",
  안정감: "bg-teal-100 text-teal-700",
  폭발력: "bg-fuchsia-100 text-fuchsia-700",
  국가대표: "bg-green-100 text-green-700",
  신인왕: "bg-lime-100 text-lime-700",
  MVP: "bg-emerald-100 text-emerald-700",
  베테랑: "bg-zinc-100 text-zinc-600",
  "골밑 핵심": "bg-purple-100 text-purple-700",
  윙: "bg-teal-100 text-teal-700",
};

export const TEAM_COLORS: Record<
  string,
  { bg: string; text: string; light: string }
> = {
  [TN.WOORI]: { bg: "#003DA5", text: "white", light: "#e5ecf7" },
  [TN.HANA]: { bg: "#007B5F", text: "white", light: "#e6f4f0" },
  [TN.SAMSUNG]: { bg: "#1428A0", text: "white", light: "#e8eaf6" },
  [TN.BNK]: { bg: "#E31837", text: "white", light: "#fde8eb" },
  [TN.KB]: { bg: "#CB9E00", text: "white", light: "#fdf6e3" },
  [TN.SHINHAN]: { bg: "#0046FF", text: "white", light: "#e5ebff" },
};

export const TEAM_LOGOS: Record<string, string> = {
  [TN.WOORI]: "https://www.wkbl.or.kr/static/images/team/teamlogo_05.png",
  [TN.HANA]: "https://www.wkbl.or.kr/static/images/team/teamlogo_09.png",
  [TN.SAMSUNG]: "https://www.wkbl.or.kr/static/images/team/teamlogo_03.png",
  [TN.BNK]: "https://www.wkbl.or.kr/static/images/team/teamlogo_11.png",
  [TN.KB]: "https://www.wkbl.or.kr/static/images/team/teamlogo_01.png",
  [TN.SHINHAN]: "https://www.wkbl.or.kr/static/images/team/teamlogo_07.png",
};
