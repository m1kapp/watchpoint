"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Section } from "@m1kapp/ui";
import { PLAYERS } from "@/lib/data";
import nationalTeamData from "../../../data/wkbl/national-team.json";
import tournamentsData from "../../../data/wkbl/national-tournaments.json";
import { PlayerCard } from "@/components/player-card";
import { PlayerDetail } from "@/components/player-detail";
import { SourceRow } from "@/components/source-chip";
import { SORT_OPTIONS, sortPlayers } from "@/components/tabs/roster-tab";
import type { Player } from "@/lib/types";
import type { SortKey } from "@/components/tabs/roster-tab";

const KR_RED  = "#CD2E3A";
const KR_BLUE = "#003478";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface NationalPlayer {
  name: string;
  pno: string;
  level: "A대표팀" | "국가대표 후보";
  wkblTeamId: string;
  captain?: boolean;
  overseas?: string;
}

interface TournamentRecord {
  name: string;
  emoji: string;
  appearances: number;
  record: string;
  medals: string;
  note: string;
  color: string;
}

interface NationalTeamDef {
  id: string;
  name: string;
  sub: string;
  color: string;
  emoji: string;
  ranking?: string;
  recentResult?: string;
  hasData: boolean;
  // 상세 화면용 데이터
  headerTitle?: string;
  headerSub?: string;
  roster?: NationalPlayer[];
  tournaments?: TournamentRecord[];
  tournamentSources?: { label: string; url: string }[];
}

interface NationalTeamGroup {
  id: "w" | "m";
  label: string;
  color: string;
  teams: NationalTeamDef[];
}

// ─── 여자 A대표팀 데이터 (data/wkbl/national-team.json, national-tournaments.json) ──

const W_A_ROSTER = nationalTeamData.roster as NationalPlayer[];
const W_A_TOURNAMENTS = tournamentsData as TournamentRecord[];

// ─── 국가대표팀 목록 ──────────────────────────────────────────────────────────

const NATIONAL_TEAM_GROUPS: NationalTeamGroup[] = [
  {
    id: "w",
    label: "여자농구",
    color: KR_RED,
    teams: [
      {
        id: "w-a",
        name: "A대표팀",
        sub: "아시안컵 · 아시안게임 · 세계선수권 · 올림픽",
        color: KR_RED,
        emoji: "🏀",
        ranking: "세계 15위",
        recentResult: "'25 아시안컵 4위",
        hasData: true,
        headerTitle: "대한민국 여자농구",
        headerSub: "'25 아시안컵 4위 · 아시안컵 금메달 12회",
        roster: W_A_ROSTER,
        tournaments: W_A_TOURNAMENTS,
        tournamentSources: [
          { label: "위키백과", url: "https://ko.wikipedia.org/wiki/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD_%EC%97%AC%EC%9E%90_%EB%86%8D%EA%B5%AC_%EA%B5%AD%EA%B0%80%EB%8C%80%ED%91%9C%ED%8C%80" },
          { label: "FIBA", url: "https://www.fiba.basketball" },
        ],
      },
      { id: "w-u19",  name: "U-19",         sub: "FIBA U19 Women's World Cup",    color: KR_RED,    emoji: "🌱", hasData: false },
      { id: "w-u18",  name: "U-18",         sub: "FIBA U18 Women's Asia Cup",     color: KR_RED,    emoji: "🌱", hasData: false },
      { id: "w-u17",  name: "U-17",         sub: "FIBA U17 Women's World Cup",    color: KR_RED,    emoji: "🌱", hasData: false },
      { id: "w-3x3",  name: "3x3",          sub: "FIBA 3x3 Women's World Cup",    color: "#8B5CF6", emoji: "3️⃣", hasData: false },
      { id: "w-univ", name: "유니버시아드", sub: "World University Games",        color: "#059669", emoji: "🎓", hasData: false },
    ],
  },
  {
    id: "m",
    label: "남자농구",
    color: KR_BLUE,
    teams: [
      { id: "m-a",    name: "A대표팀",       sub: "아시안컵 · 아시안게임 · 세계선수권 · 올림픽", color: KR_BLUE,   emoji: "🏀", ranking: "세계 28위", hasData: false },
      { id: "m-u19",  name: "U-19",          sub: "FIBA U19 World Cup",            color: KR_BLUE,   emoji: "🌱", hasData: false },
      { id: "m-u18",  name: "U-18",          sub: "FIBA U18 Asia Cup",             color: KR_BLUE,   emoji: "🌱", hasData: false },
      { id: "m-u17",  name: "U-17",          sub: "FIBA U17 World Cup",            color: KR_BLUE,   emoji: "🌱", hasData: false },
      { id: "m-3x3",  name: "3x3",           sub: "FIBA 3x3 World Cup",            color: "#8B5CF6", emoji: "3️⃣", hasData: false },
      { id: "m-univ", name: "유니버시아드",  sub: "World University Games",        color: "#059669", emoji: "🎓", hasData: false },
    ],
  },
];

// ─── 목록 카드 ────────────────────────────────────────────────────────────────

function NationalTeamListCard({ team, onClick }: { team: NationalTeamDef; onClick: () => void }) {
  return (
    <button
      onClick={team.hasData ? onClick : () => toast.info("준비중입니다")}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl active:scale-[0.98] transition-all"
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07)" }}
    >
      <div className="px-4 py-4 flex items-start gap-3.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl mt-0.5"
          style={{ backgroundColor: `${team.color}18` }}
        >
          {team.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-black text-zinc-900 dark:text-white leading-tight">🇰🇷 {team.name}</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-snug">{team.sub}</p>
          {team.hasData && (team.ranking || team.recentResult) && (
            <div className="flex items-center gap-2 mt-2">
              {team.ranking && (
                <span className="text-sm font-black tabular-nums" style={{ color: team.color }}>{team.ranking}</span>
              )}
              {team.ranking && team.recentResult && (
                <span className="text-zinc-300 dark:text-zinc-600 text-xs">·</span>
              )}
              {team.recentResult && (
                <span className="text-sm font-black text-zinc-900 dark:text-white">{team.recentResult}</span>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 mt-1">
          {team.hasData ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
              className="text-zinc-300 dark:text-zinc-600">
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : (
            <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-medium">준비 중</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── 공통 국가대표 상세 컴포넌트 ──────────────────────────────────────────────

function NationalTeamDetail({
  team,
  accentColor,
  backLabel,
  onBack,
}: {
  team: NationalTeamDef;
  accentColor: string;
  backLabel: string;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<Player | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("tags");

  const roster = team.roster ?? [];
  const players = roster
    .map((nat) => PLAYERS.find((p) => p.id === `${nat.wkblTeamId}-${nat.pno}`))
    .filter((p): p is Player => p !== undefined);

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

  const headerRankLine = [
    team.name,
    team.ranking ? `FIBA ${team.ranking}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <>
      {/* 뒤로 */}
      <div className="px-4 pt-3 pb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 active:text-zinc-900 dark:active:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {backLabel}
        </button>
      </div>

      {/* 팀 헤더 — TeamRosterView와 동일한 포맷 */}
      <div className="px-4 pt-2 pb-4">
        <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
          {/* 로고 배너 */}
          <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-3"
            style={{ backgroundColor: `${team.color}10` }}>
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-6xl"
              style={{ backgroundColor: `${team.color}18` }}>
              🇰🇷
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">
                {headerRankLine}
              </p>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">
                {team.headerTitle ?? `대한민국 ${team.name}`}
              </h2>
              {team.headerSub && (
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{team.headerSub}</p>
              )}
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
              <p className="text-base font-black tabular-nums" style={{ color: accentColor }}>{avgCareer}년</p>
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
                  ? { backgroundColor: accentColor, color: "white" }
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

      {/* 대회 기록 */}
      {team.tournaments && team.tournaments.length > 0 && (
        <>
          <div className="px-4 mt-4 mb-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">대회 역대 기록</p>
              {team.tournamentSources && <SourceRow sources={team.tournamentSources} />}
            </div>
          </div>
          <Section>
            <div className="flex flex-col gap-2">
              {team.tournaments.map((t) => (
                <div key={t.name} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5">{t.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">{t.name}</p>
                        <p className="text-[11px] font-bold" style={{ color: t.color }}>{t.medals}</p>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t.appearances}회 출전 · {t.record}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{t.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      <div className="h-6" />
      {selected && <PlayerDetail player={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

// ─── 국가대표 탭 진입점 ────────────────────────────────────────────────────────

export const NATIONAL_YEARS = [2025, 2024, 2023, 2022, 2021];

export function NationalTab({ gender }: { gender: "w" | "m" }) {
  const [selected, setSelected] = useState<NationalTeamDef | null>(null);

  const group = NATIONAL_TEAM_GROUPS.find((g) => g.id === gender)!;
  const accentColor = gender === "w" ? KR_RED : KR_BLUE;

  if (selected?.hasData) {
    return (
      <NationalTeamDetail
        team={selected}
        accentColor={accentColor}
        backLabel={group.label}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <>
      <div className="pt-3">
        <Section>
          <div className="flex flex-col gap-2">
            {group.teams.map((team) => (
              <NationalTeamListCard key={team.id} team={team} onClick={() => setSelected(team)} />
            ))}
          </div>
        </Section>
      </div>

      <div className="h-6" />
    </>
  );
}
