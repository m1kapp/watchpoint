"use client";

import { useState } from "react";
import Image from "next/image";
import { Section } from "@m1kapp/ui";
import { PLAYERS, TEAMS, TAG_COLORS, type WKBLTeam } from "@/lib/data";
import { TEAM_LOGOS } from "@/lib/matches";
import type { Player } from "@/lib/types";
import { PlayerCard } from "@/components/player-card";
import { PlayerDetail } from "@/components/player-detail";

// ─── 리그 팀 목록 ─────────────────────────────────────────────

function TeamListCard({ team, onClick }: { team: WKBLTeam; onClick: () => void }) {
  const players = PLAYERS.filter((p) => p.teamId === team.id);
  const nationalCount = players.filter((p) => p.bio.national_team.is_national).length;
  const hasData = players.length > 0;
  const logo = TEAM_LOGOS[team.name];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl active:scale-[0.98] transition-all"
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(0,0,0,0.03)" }}
    >
      <div className="px-4 py-4 flex items-center gap-3.5">
        {/* 로고 / 순위 뱃지 */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: logo ? `${team.color}18` : team.color }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={team.name} className="w-7 h-7 object-contain" />
          ) : (
            <span className="text-white text-sm font-black">{team.rank}</span>
          )}
        </div>

        {/* 팀 정보 */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-black text-zinc-900 dark:text-white leading-tight">{team.name}</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{team.summary}</p>
        </div>

        {/* 선수 수 / 준비중 */}
        {hasData ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">선수</p>
              <p className="text-sm font-black text-zinc-900 dark:text-white tabular-nums">{players.length}명</p>
            </div>
            {nationalCount > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">국가대표</p>
                <p className="text-sm font-black tabular-nums" style={{ color: team.color }}>
                  🇰🇷 {nationalCount}명
                </p>
              </div>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              className="text-zinc-300 dark:text-zinc-600 shrink-0">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-medium shrink-0">준비 중</span>
        )}
      </div>
    </button>
  );
}

// ─── 팀 로스터 상세 ────────────────────────────────────────────

function TeamRosterView({
  team,
  onBack,
}: {
  team: WKBLTeam;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<Player | null>(null);
  const players = PLAYERS.filter((p) => p.teamId === team.id);
  const nationalCount = players.filter((p) => p.bio.national_team.is_national).length;
  const logo = TEAM_LOGOS[team.name];

  // 포지션 순서: PG → SG → SF → PF → C
  const posOrder: Record<string, number> = { PG: 0, SG: 1, SF: 2, PF: 3, C: 4 };
  const sorted = [...players].sort((a, b) => (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9));

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
          <div className="bg-white dark:bg-zinc-900 px-4 py-4 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: logo ? `${team.color}18` : team.color }}
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={team.name} className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-white text-xl font-black">{team.rank}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
                {team.league} 2025-26 · {team.rank}위
              </p>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white leading-tight">{team.name}</h2>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{team.summary}</p>
            </div>
          </div>
          <div className="flex border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex-1 px-4 py-2.5 text-center">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">등록 선수</p>
              <p className="text-base font-black text-zinc-900 dark:text-white tabular-nums">{players.length}명</p>
            </div>
            <div className="w-px bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex-1 px-4 py-2.5 text-center">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">국가대표</p>
              <p className="text-base font-black tabular-nums" style={{ color: nationalCount > 0 ? team.color : undefined }}>
                {nationalCount > 0 ? `🇰🇷 ${nationalCount}명` : "–"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 선수 목록 */}
      <div className="px-4 mb-2">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">로스터</p>
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
  WKBL: { label: "WKBL", sub: "한국 여자 프로농구", color: "#007B5F" },
  KBL:  { label: "KBL",  sub: "한국 남자 프로농구", color: "#0B3D91" },
} as const;

export function RosterTab() {
  const [selectedTeam, setSelectedTeam] = useState<WKBLTeam | null>(null);
  const [league, setLeague] = useState<"WKBL" | "KBL">("WKBL");

  if (selectedTeam) {
    return <TeamRosterView team={selectedTeam} onBack={() => setSelectedTeam(null)} />;
  }

  const leagueTeams  = TEAMS.filter((t) => t.league === league && PLAYERS.some((p) => p.teamId === t.id));
  const leaguePlayers = PLAYERS.filter((p) => leagueTeams.some((t) => t.id === p.teamId));
  const nationalCount = leaguePlayers.filter((p) => p.bio.national_team.is_national).length;
  const meta = LEAGUE_META[league];

  return (
    <>
      {/* 리그 탭 */}
      <div className="px-4 pt-4 pb-0 flex gap-2">
        {(["WKBL", "KBL"] as const).map((lg) => {
          const m = LEAGUE_META[lg];
          const active = league === lg;
          return (
            <button
              key={lg}
              onClick={() => setLeague(lg)}
              className="px-4 py-2 rounded-full text-[12px] font-black transition-all"
              style={
                active
                  ? { backgroundColor: m.color, color: "white" }
                  : { backgroundColor: "#f4f4f5", color: "#71717a" }
              }
            >
              {m.label} {lg === "WKBL" ? "여자" : "남자"}
            </button>
          );
        })}
      </div>

      {/* 리그 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
          {meta.label} 2025-26 시즌
        </p>
        <h1 className="text-xl font-black text-zinc-900 dark:text-white">{meta.sub}</h1>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
          {leagueTeams.length}개 팀 · {leaguePlayers.length}명 등록 · 국가대표 {nationalCount}명
        </p>
      </div>

      {/* 팀 목록 */}
      <Section>
        <div className="flex flex-col gap-2.5">
          {leagueTeams.map((team) => (
            <TeamListCard key={team.id} team={team} onClick={() => setSelectedTeam(team)} />
          ))}
        </div>
      </Section>
    </>
  );
}
