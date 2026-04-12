"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Section } from "@m1kapp/ui";
import { SourceChip } from "@/components/source-chip";
import { PLAYERS, TEAMS, TAG_COLORS, type WKBLTeam } from "@/lib/data";
import { TEAM_LOGOS } from "@/lib/matches";
import type { Player } from "@/lib/types";
import { PlayerCard } from "@/components/player-card";
import { PlayerDetail } from "@/components/player-detail";
import { NationalTab, NATIONAL_YEARS } from "@/components/tabs/national-tab";

// ─── 리그 팀 목록 ─────────────────────────────────────────────

function TeamListCard({ team, onClick }: { team: WKBLTeam; onClick: () => void }) {
  const players = PLAYERS.filter((p) => p.teamId === team.id);
  const nationalCount = players.filter((p) => p.bio.national_team.is_national).length;
  const hasData = players.length > 0;
  const logo = TEAM_LOGOS[team.name];

  const playersWithStats = players.filter((p) => p.seasonStats && (p.seasonStats.games ?? 0) >= 5);
  const teamPpg = playersWithStats.length
    ? Math.round(playersWithStats.reduce((s, p) => s + (p.seasonStats?.ppg ?? 0), 0) * 10) / 10
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

// ─── 팀 로스터 상세 ────────────────────────────────────────────

export type SortKey = "tags" | "career" | "age" | "height" | "position";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "tags",     label: "칩많은순" },
  { key: "career",   label: "경력순" },
  { key: "age",      label: "나이순" },
  { key: "height",   label: "신장순" },
  { key: "position", label: "포지션" },
];

export function sortPlayers(players: Player[], key: SortKey): Player[] {
  const posOrder: Record<string, number> = { PG: 0, SG: 1, SF: 2, PF: 3, C: 4 };

  const byTags   = (a: Player, b: Player) => b.tags.length - a.tags.length;
  const byCareer = (a: Player, b: Player) => b.bio.career_year - a.bio.career_year;
  const byAge    = (a: Player, b: Player) => a.bio.birth_year - b.bio.birth_year; // 출생년도 작을수록 연장자
  const byHeight = (a: Player, b: Player) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0);
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
    position: chain(byPos, byTags, byCareer),
  }[key];

  return [...players].sort(comparator);
}

function TeamRosterView({
  team,
  onBack,
}: {
  team: WKBLTeam;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<Player | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("tags");
  const players = PLAYERS.filter((p) => p.teamId === team.id);
  const nationalCount = players.filter((p) => p.bio.national_team.is_national).length;
  const logo = TEAM_LOGOS[team.name];

  const avgHeight = players.length
    ? Math.round(players.reduce((s, p) => s + (parseFloat(p.height) || 0), 0) / players.length * 10) / 10
    : 0;
  const avgAge = players.length
    ? Math.round(players.reduce((s, p) => s + p.bio.age, 0) / players.length * 10) / 10
    : 0;
  const avgCareer = players.length
    ? Math.round(players.reduce((s, p) => s + p.bio.career_year, 0) / players.length * 10) / 10
    : 0;

  const sorted = sortPlayers(players, sortKey);

  return (
    <>
      {/* 뒤로 버튼 */}
      <div className="px-4 pt-3 pb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 active:text-zinc-900 dark:active:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          WKBL 리그
        </button>
      </div>

      {/* 팀 헤더 */}
      <div className="px-4 pt-2 pb-4">
        <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
          {/* 로고 배너 */}
          <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-3"
            style={{ backgroundColor: `${team.color}10` }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={team.name} className="w-24 h-24 object-contain drop-shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-black"
                style={{ backgroundColor: team.color }}>
                {team.rank}
              </div>
            )}
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
                {team.league} 2025-26 · {team.rank}위
              </p>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{team.name}</h2>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{team.summary}</p>
            </div>
          </div>
          <div className="flex border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex-1 px-3 py-2.5 text-center">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">등록선수</p>
              <p className="text-base font-black text-zinc-900 dark:text-white tabular-nums">{players.length}명</p>
            </div>
            <div className="w-px bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex-1 px-3 py-2.5 text-center">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">평균신장</p>
              <p className="text-base font-black text-zinc-900 dark:text-white tabular-nums">{avgHeight}cm</p>
            </div>
            <div className="w-px bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex-1 px-3 py-2.5 text-center">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">평균나이</p>
              <p className="text-base font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter">만 {avgAge}세</p>
            </div>
            <div className="w-px bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex-1 px-3 py-2.5 text-center">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">평균경력</p>
              <p className="text-base font-black tabular-nums" style={{ color: team.color }}>{avgCareer}년</p>
            </div>
          </div>
        </div>
      </div>

      {/* 정렬 */}
      <div className="px-4 mb-2 flex items-center gap-2">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">로스터</p>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all"
              style={
                sortKey === key
                  ? { backgroundColor: team.color, color: "white" }
                  : { backgroundColor: "#f4f4f5", color: "#71717a" }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <Section>
        {sorted.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-12">선수 정보 준비 중입니다</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((player) => (
              <PlayerCard key={player.id} player={player} onClick={() => setSelected(player)} />
            ))}
          </div>
        )}
      </Section>

      {selected && (
        <PlayerDetail player={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

// ─── 로스터 탭 (진입점) ────────────────────────────────────────

const LEAGUE_META = {
  WKBL:  { label: "WKBL 여자",   sub: "한국 여자 프로농구",          color: "#007B5F" },
  NAT_W: { label: "🇰🇷 여자대표", sub: "대한민국 여자농구 국가대표팀", color: "#CD2E3A" },
} as const;

type LeagueKey = keyof typeof LEAGUE_META;

const WKBL_SEASONS = ["2025-26", "2024-25", "2023-24", "2022-23"];

export function RosterTab({ initialTeamId }: { initialTeamId?: string }) {
  const [selectedTeam, setSelectedTeam] = useState<WKBLTeam | null>(
    () => initialTeamId ? (TEAMS.find((t) => t.id === initialTeamId) ?? null) : null
  );
  const [league, setLeague] = useState<LeagueKey>("WKBL");
  const [season, setSeason] = useState("2025-26");
  const [natYear, setNatYear] = useState(2025);

  if (selectedTeam) {
    return <TeamRosterView team={selectedTeam} onBack={() => setSelectedTeam(null)} />;
  }

  const isNat = league === "NAT_W";

  // 시즌/연도 탭 (리그에 따라 다른 데이터)
  const SeasonTabs = () => isNat ? (
    <div className="px-4 pt-4 pb-0 flex gap-1.5 overflow-x-auto scrollbar-none">
      {NATIONAL_YEARS.map((y) => {
        const active = natYear === y;
        const hasData = y === 2025;
        return (
          <button key={y}
            onClick={() => { if (hasData) setNatYear(y); else toast.info("준비중입니다"); }}
            className="shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition-all"
            style={active
              ? { backgroundColor: "#18181b", color: "white" }
              : { backgroundColor: "#f4f4f5", color: hasData ? "#71717a" : "#d4d4d8" }}>
            {y}
          </button>
        );
      })}
    </div>
  ) : (
    <div className="px-4 pt-4 pb-0 flex gap-1.5 overflow-x-auto scrollbar-none">
      {WKBL_SEASONS.map((s) => {
        const active = season === s;
        const hasData = s === "2025-26";
        return (
          <button key={s}
            onClick={() => { if (hasData) setSeason(s); else toast.info("준비중입니다"); }}
            className="shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition-all"
            style={active
              ? { backgroundColor: "#18181b", color: "white" }
              : { backgroundColor: "#f4f4f5", color: hasData ? "#71717a" : "#d4d4d8" }}>
            {s}
          </button>
        );
      })}
    </div>
  );

  // 리그 탭
  const LeagueTabs = () => (
    <div className="px-4 pt-3 pb-0 flex gap-2 overflow-x-auto scrollbar-none">
      {(Object.keys(LEAGUE_META) as LeagueKey[]).map((lg) => {
        const m = LEAGUE_META[lg];
        const active = league === lg;
        return (
          <button key={lg} onClick={() => setLeague(lg)}
            className="shrink-0 px-4 py-2 rounded-full text-[12px] font-black transition-all"
            style={active ? { backgroundColor: m.color, color: "white" } : { backgroundColor: "#f4f4f5", color: "#71717a" }}>
            {m.label}
          </button>
        );
      })}
    </div>
  );

  if (isNat) {
    return (
      <>
        <SeasonTabs />
        <LeagueTabs />
        <NationalTab gender="w" />
      </>
    );
  }

  const leagueTeams = TEAMS.filter((t) => t.league === league && PLAYERS.some((p) => p.teamId === t.id));

  return (
    <>
      <SeasonTabs />
      <LeagueTabs />

      {/* 팀 목록 */}
      <div className="pt-3">
        <Section>
          <div className="flex flex-col gap-2.5">
            {leagueTeams.map((team) => (
              <TeamListCard key={team.id} team={team} onClick={() => setSelectedTeam(team)} />
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
