"use client";

import { useState } from "react";
import { Section } from "@m1kapp/ui";
import { PLAYERS, TEAMS, TAG_COLORS, type WKBLTeam } from "@/lib/data";
import { TEAM_LOGOS } from "@/lib/matches";
import type { Player } from "@/lib/types";
import { PlayerCard } from "@/components/player-card";
import { PlayerDetail } from "@/components/player-detail";
import { NationalTab } from "@/components/tabs/national-tab";
import { DropdownSelector } from "@/components/dropdown-selector";

// ─── 리그 팀 목록 ─────────────────────────────────────────────

function TeamListCard({ team, onClick }: { team: WKBLTeam; onClick: () => void }) {
  const players = PLAYERS.filter((p) => p.teamId === team.id);
  const nationalCount = players.filter((p) => p.bio.national_team.is_national).length;
  const hasData = players.length > 0;
  const logo = TEAM_LOGOS[team.shortName];

  const playersWithStats = players.filter((p) => (p.career_seasons?.[0]?.games ?? 0) >= 5);
  const teamPpg = playersWithStats.length
    ? Math.round(playersWithStats.reduce((s, p) => s + (p.career_seasons?.[0]?.points ?? 0), 0) * 10) / 10
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl active:scale-[0.98] transition-all"
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(0,0,0,0.03)" }}
    >
      <div className="px-4 py-4 flex items-center gap-3.5">
        {/* 로고 / 순위 뱃지 */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: logo ? `${team.color}18` : team.color }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={team.name} className="w-11 h-11 object-contain" />
          ) : (
            <span className="text-white text-lg font-black">{team.rank}</span>
          )}
        </div>

        {/* 팀 정보 */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-black text-zinc-900 dark:text-white leading-tight">{team.name}</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{team.summary}</p>
          {hasData && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-black tabular-nums" style={{ color: team.color }}>
                리그 {team.rank}위
              </span>
              {teamPpg !== null && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white tabular-nums">
                    팀 {teamPpg}점
                  </span>
                </>
              )}
              {nationalCount > 0 && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
                  <span className="text-sm font-black tabular-nums" style={{ color: team.color }}>
                    🇰🇷 {nationalCount}명
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 화살표 / 준비중 */}
        {hasData ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            className="text-zinc-300 dark:text-zinc-600 shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        ) : (
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-medium shrink-0">준비 중</span>
        )}
      </div>
    </button>
  );
}

// ─── 팀 컴팩트 헤더 ───────────────────────────────────────────

function TeamCompactHeader({ team }: { team: WKBLTeam }) {
  const logo = TEAM_LOGOS[team.shortName];
  const players = PLAYERS.filter((p) => p.teamId === team.id);
  const avgHeight = players.length
    ? Math.round(players.reduce((s, p) => s + (parseFloat(p.height) || 0), 0) / players.length * 10) / 10
    : 0;
  const avgCareer = players.length
    ? Math.round(players.reduce((s, p) => s + p.bio.career_year, 0) / players.length * 10) / 10
    : 0;

  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl px-4 py-3 flex items-center gap-3"
      style={{ backgroundColor: `${team.color}10` }}>
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={team.name} className="w-10 h-10 object-contain shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight truncate">{team.name}</p>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 tabular-nums">
          리그 <span className="font-black" style={{ color: team.color }}>{team.rank}위</span>
          {" · "}{players.length}명{" · "}평균 {avgHeight}cm · {avgCareer}년차
        </p>
      </div>
    </div>
  );
}

// ─── 팀 로스터 상세 ────────────────────────────────────────────

export type SortKey = "tags" | "career" | "age" | "height" | "position" | "number";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "tags",     label: "태그순" },
  { key: "career",   label: "경력순" },
  { key: "age",      label: "나이순" },
  { key: "height",   label: "신장순" },
  { key: "number",   label: "번호순" },
  { key: "position", label: "포지션" },
];

export function sortPlayers(players: Player[], key: SortKey): Player[] {
  const posOrder: Record<string, number> = { PG: 0, SG: 1, SF: 2, PF: 3, C: 4 };

  const byTags   = (a: Player, b: Player) => b.tags.length - a.tags.length;
  const byCareer = (a: Player, b: Player) => b.bio.career_year - a.bio.career_year;
  const byAge    = (a: Player, b: Player) => a.bio.birth_year - b.bio.birth_year; // 출생년도 작을수록 연장자
  const byHeight = (a: Player, b: Player) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0);
  const byNumber = (a: Player, b: Player) => (a.number ?? 99) - (b.number ?? 99);
  const byPos    = (a: Player, b: Player) => (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9);

  const chain = (...fns: ((a: Player, b: Player) => number)[]) =>
    (a: Player, b: Player) => {
      for (const fn of fns) {
        const r = fn(a, b);
        if (r !== 0) return r;
      }
      return 0;
    };

  const comparator = {
    tags:     chain(byTags, byCareer, byAge),
    career:   chain(byCareer, byTags, byAge),
    age:      chain(byAge, byTags, byCareer),
    height:   chain(byHeight, byTags, byCareer),
    number:   chain(byNumber),
    position: chain(byPos, byTags, byCareer),
  }[key];

  return [...players].sort(comparator);
}


// ─── 로스터 탭 ───────────────────────────────────────────────

const LEAGUE_META = {
  WKBL:  { label: "WKBL 여자",   color: "#007B5F" },
  NAT_W: { label: "🇰🇷 여자대표", color: "#CD2E3A" },
} as const;

type LeagueKey = keyof typeof LEAGUE_META;

const WKBL_SEASONS = ["2025-26", "2024-25", "2023-24", "2022-23"];

export function RosterTab({ initialTeamId }: { initialTeamId?: string }) {
  const [league, setLeague] = useState<LeagueKey>("WKBL");
  const [season, setSeason] = useState("2025-26");
  const [view, setView] = useState<"team" | "player">("team");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(initialTeamId ?? null);
  const [sortKey, setSortKey] = useState<SortKey>("tags");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const isNat = league === "NAT_W";
  const accentColor = LEAGUE_META[league].color;

  const leagueTeams = TEAMS.filter((t) => t.league === "WKBL" && PLAYERS.some((p) => p.teamId === t.id));
  const selectedTeam = leagueTeams.find((t) => t.id === selectedTeamId) ?? null;
  const leagueOptions = (Object.keys(LEAGUE_META) as LeagueKey[]).map((k) => ({
    key: k, label: LEAGUE_META[k].label,
  }));
  const seasonOptions = WKBL_SEASONS.map((s) => ({ key: s, label: s, disabled: s !== "2025-26" }));

  const teamPlayers = selectedTeam ? PLAYERS.filter((p) => p.teamId === selectedTeam.id) : PLAYERS.filter((p) => leagueTeams.some((t) => t.id === p.teamId));
  const sorted = sortPlayers(teamPlayers, sortKey);

  // 팀 상세 뷰 (팀 탭에서 팀 카드 클릭 시)
  if (!isNat && view === "team" && selectedTeam) {
    return (
      <>
        {/* 뒤로 버튼 */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => setSelectedTeamId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 active:text-zinc-900 dark:active:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            팀 목록
          </button>
        </div>

        <TeamCompactHeader team={selectedTeam} />

        {/* 정렬 칩 */}
        <div className="px-4 pt-3 pb-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0 mr-0.5">정렬</p>
          {SORT_OPTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => setSortKey(key)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all"
              style={sortKey === key ? { backgroundColor: selectedTeam.color, color: "white" } : { backgroundColor: "#f4f4f5", color: "#71717a" }}>
              {label}
            </button>
          ))}
        </div>

        <Section>
          <div className="flex flex-col gap-2 pt-3">
            {sorted.map((player) => (
              <PlayerCard key={player.id} player={player} onClick={() => setSelectedPlayer(player)} />
            ))}
          </div>
        </Section>

        {selectedPlayer && <PlayerDetail player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
      </>
    );
  }

  return (
    <>
      {/* 셀렉터 바 — 구분 + 시즌 */}
      <div className="px-4 pt-4 pb-0 flex items-stretch gap-2">
        <DropdownSelector
          label="구분"
          value={LEAGUE_META[league].label}
          options={leagueOptions}
          onSelect={(k) => { setLeague(k as LeagueKey); setSelectedTeamId(null); }}
          accentColor={accentColor}
        />
        <DropdownSelector
          label="시즌"
          value={season}
          options={seasonOptions}
          onSelect={setSeason}
        />
      </div>

      {/* 팀 | 선수 세그먼트 + 정렬 칩 (선수일 때만) */}
      {!isNat && (
        <div className="px-4 pt-3 pb-0 flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5 shrink-0">
            {(["team", "player"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1 rounded-full text-[11px] font-bold transition-all"
                style={view === v
                  ? { backgroundColor: "white", color: "#18181b", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : { color: "#71717a" }}>
                {v === "team" ? "팀" : "선수"}
              </button>
            ))}
          </div>

          {view === "player" && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {SORT_OPTIONS.map(({ key, label }) => (
                <button key={key} onClick={() => setSortKey(key)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all"
                  style={sortKey === key ? { backgroundColor: accentColor, color: "white" } : { backgroundColor: "#f4f4f5", color: "#71717a" }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 국가대표 */}
      {isNat && <NationalTab gender="w" />}

      {/* 팀 뷰 — 팀 목록 */}
      {!isNat && view === "team" && (
        <div className="pt-3">
          <Section>
            <div className="flex flex-col gap-2.5">
              {leagueTeams.map((team) => (
                <TeamListCard key={team.id} team={team} onClick={() => setSelectedTeamId(team.id)} />
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* 선수 뷰 */}
      {!isNat && view === "player" && (
        <Section>
          <div className="flex flex-col gap-2 pt-3">
            {sorted.map((player) => (
              <PlayerCard key={player.id} player={player} onClick={() => setSelectedPlayer(player)} />
            ))}
          </div>
        </Section>
      )}

      {selectedPlayer && (
        <PlayerDetail player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </>
  );
}
