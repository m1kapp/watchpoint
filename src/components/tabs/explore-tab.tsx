"use client";

import { useState } from "react";
import Image from "next/image";
import { Section } from "@m1kapp/ui";
import { MATCHES, TAG_COLORS, TEAM_COLORS, TEAM_LOGOS } from "@/lib/matches";
import { PlayerDetailSheet } from "@/components/player-detail-sheet";
import type { MatchData, MatchPlayer, Evidence } from "@/lib/match-types";

type MatchWithId = MatchData & { id: string };

// ─── 경기 목록 ───────────────────────────────────────────────

function MatchListCard({ match, onClick }: { match: MatchWithId; onClick: () => void }) {
  const { match: m, teams, players } = match;
  const home = teams.find((t) => t.name === m.home);
  const away = teams.find((t) => t.name === m.away);
  const homeColors = TEAM_COLORS[m.home] ?? { bg: "#333", light: "#f4f4f5" };
  const awayColors = TEAM_COLORS[m.away] ?? { bg: "#333", light: "#f4f4f5" };
  const homeLogo = TEAM_LOGOS[m.home];
  const awayLogo = TEAM_LOGOS[m.away];
  const featuredCount = players.filter((p) => p.featured).length;
  const dateObj = new Date(m.date);
  const isToday = m.date === new Date().toISOString().slice(0, 10);
  const dateLabel = isToday ? "오늘" : `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl active:scale-[0.98] transition-all"
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(0,0,0,0.03)" }}
    >
      {/* 스테이지 헤더 */}
      <div className="px-4 pt-4 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
            {m.stage}
          </span>
        </div>
        <span className={`text-[11px] font-semibold ${isToday ? "text-emerald-500" : "text-zinc-400 dark:text-zinc-500"}`}>
          {dateLabel} {m.time}
        </span>
      </div>

      {/* VS 구역 */}
      <div className="flex items-stretch px-4 gap-2.5 pb-3.5">
        {/* 홈팀 */}
        <div className="flex-1 rounded-xl px-3 py-3 flex flex-col gap-1" style={{ backgroundColor: `${homeColors.bg}10` }}>
          <span className="text-[10px] font-black" style={{ color: homeColors.bg }}>{home?.rank}위</span>
          {homeLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={homeLogo} alt={m.home} className="w-8 h-8 object-contain my-0.5" />
          )}
          <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight">{m.home}</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">{home?.summary}</p>
        </div>

        <div className="flex items-center justify-center shrink-0 px-1">
          <span className="text-[11px] font-black text-zinc-300 dark:text-zinc-600">VS</span>
        </div>

        {/* 어웨이팀 */}
        <div className="flex-1 rounded-xl px-3 py-3 flex flex-col gap-1 items-end text-right" style={{ backgroundColor: `${awayColors.bg}10` }}>
          <span className="text-[10px] font-black" style={{ color: awayColors.bg }}>{away?.rank}위</span>
          {awayLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={awayLogo} alt={m.away} className="w-8 h-8 object-contain my-0.5" />
          )}
          <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight">{m.away}</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">{away?.summary}</p>
        </div>
      </div>

      {/* 푸터 */}
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">📍 {m.location}</span>
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">관전 포인트 {featuredCount + 2}개 →</span>
      </div>
    </button>
  );
}

// ─── 경기 상세 (관전 포인트) ─────────────────────────────────

function buildWatchPoints(match: MatchWithId) {
  const points: {
    index: number;
    title: string;
    reason: string;
    evidence: Evidence[];
    team: string;
    tags: string[];
    player?: MatchPlayer;
    isCoach?: boolean;
    coachName?: string;
  }[] = [];

  let idx = 1;
  for (const coach of match.coaches) {
    points.push({
      index: idx++,
      title: coach.watch_point,
      reason: coach.watch_reason,
      evidence: coach.evidence ?? [],
      team: coach.team,
      tags: coach.style,
      isCoach: true,
      coachName: coach.name,
    });
  }
  for (const player of match.players) {
    if (!player.featured || !player.watch_point) continue;
    points.push({
      index: idx++,
      title: player.watch_point,
      reason: player.watch_reason ?? "",
      evidence: player.evidence ?? [],
      team: player.team,
      tags: player.tags.slice(0, 2),
      player,
    });
  }
  return points;
}

// 경기 팀명 → 로스터 teamId 매핑
const TEAM_NAME_TO_ID: Record<string, string> = {
  "하나은행": "hana",
  "삼성생명": "samsung",
  "고양 소노": "sono",
  "원주 DB": "db",
  "우리은행": "woori",
  "BNK": "bnk",
  "KB": "kb",
  "신한은행": "shinhan",
};

function MatchDetail({ match, onBack, onViewRoster }: {
  match: MatchWithId;
  onBack: () => void;
  onViewRoster?: (teamId: string) => void;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<MatchPlayer | null>(null);
  const { match: m, teams } = match;
  const homeColors = TEAM_COLORS[m.home] ?? { bg: "#333", light: "#f4f4f5" };
  const awayColors = TEAM_COLORS[m.away] ?? { bg: "#333", light: "#f4f4f5" };
  const homeLogo = TEAM_LOGOS[m.home];
  const awayLogo = TEAM_LOGOS[m.away];
  const watchPoints = buildWatchPoints(match);
  const dateObj = new Date(m.date);
  const isToday = m.date === new Date().toISOString().slice(0, 10);
  const home = teams.find((t) => t.name === m.home);
  const away = teams.find((t) => t.name === m.away);

  return (
    <>
      {/* 뒤로 버튼 */}
      <div className="px-4 pt-3 pb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 active:text-zinc-900 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          경기 목록
        </button>
      </div>

      {/* 매치 헤더 */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex justify-center items-center gap-2 mb-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-900 text-white tracking-wide">
            {m.stage}
          </span>
        </div>
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <div className="flex">
            {/* 홈 */}
            <div className="flex-1 flex flex-col items-start px-4 py-4 gap-1 bg-zinc-50 dark:bg-zinc-800/60">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: homeColors.bg }}>{home?.rank}위</span>
              {homeLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={homeLogo} alt={m.home} className="w-8 h-8 object-contain my-0.5" />
              )}
              <p className="text-sm font-black text-zinc-900 dark:text-white">{m.home}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{home?.summary}</p>
              {onViewRoster && TEAM_NAME_TO_ID[m.home] && (
                <button
                  onClick={() => onViewRoster(TEAM_NAME_TO_ID[m.home])}
                  className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: homeColors.bg, backgroundColor: `${homeColors.bg}15` }}
                >
                  로스터 보기 →
                </button>
              )}
            </div>
            {/* 중앙 */}
            <div className="flex flex-col items-center justify-center px-3 py-4 bg-white dark:bg-zinc-900 gap-1 shrink-0">
              <span className="text-xs font-black text-zinc-300 dark:text-zinc-600 tracking-widest">VS</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{isToday ? "오늘" : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{m.time}</span>
            </div>
            {/* 어웨이 */}
            <div className="flex-1 flex flex-col items-end px-4 py-4 gap-1 bg-zinc-50 dark:bg-zinc-800/60">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: awayColors.bg }}>{away?.rank}위</span>
              {awayLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={awayLogo} alt={m.away} className="w-8 h-8 object-contain my-0.5" />
              )}
              <p className="text-sm font-black text-zinc-900 dark:text-white text-right">{m.away}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 text-right">{away?.summary}</p>
              {onViewRoster && TEAM_NAME_TO_ID[m.away] && (
                <button
                  onClick={() => onViewRoster(TEAM_NAME_TO_ID[m.away])}
                  className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: awayColors.bg, backgroundColor: `${awayColors.bg}15` }}
                >
                  로스터 보기 →
                </button>
              )}
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/60 px-4 py-2 flex items-center justify-center gap-1.5 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">📍</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{m.location}</span>
          </div>
        </div>
      </div>

      {/* 관전 포인트 */}
      <div className="px-4 mb-3">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">관전 포인트</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{watchPoints.length}가지 핵심 포인트</p>
      </div>

      <div className="px-4 flex flex-col gap-4 pb-6">
        {watchPoints.map((wp) => {
          const colors = TEAM_COLORS[wp.team] ?? { bg: "#333", text: "white", light: "#f4f4f5" };
          const isNational = wp.player?.bio?.national_team?.is_national;

          return (
            <button
              key={wp.index}
              className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl active:scale-[0.98] transition-all"
              style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(0,0,0,0.03)" }}
              onClick={() => wp.player && setSelectedPlayer(wp.player)}
            >
              <div className="px-4 py-4">
                {/* 번호 + 팀 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-black leading-none tabular-nums" style={{ color: colors.bg }}>
                    {String(wp.index).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colors.bg }}>
                    {wp.team}
                  </span>
                  {wp.isCoach && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      감독
                    </span>
                  )}
                </div>

                {/* 타이틀 */}
                <p className="text-[17px] font-black text-zinc-900 dark:text-white leading-snug mb-2">
                  {wp.title}
                </p>

                {/* 선수 / 감독 */}
                {wp.player ? (
                  <div className="flex items-center gap-2 mb-3">
                    {wp.player.imageUrl ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        <Image src={wp.player.imageUrl} alt={wp.player.name} width={24} height={24} className="w-full h-full object-cover object-top" unoptimized />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ backgroundColor: colors.bg }}>
                        {wp.player.name[0]}
                      </div>
                    )}
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {wp.player.name}{isNational && " 🇰🇷"}
                      <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1">{wp.player.position} · {wp.player.height}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">🧑‍💼 {wp.coachName} 감독</p>
                )}

                {/* 한줄 요약 */}
                {wp.reason && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">{wp.reason}</p>
                )}

                {/* 수치 근거 */}
                {wp.evidence.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1.5">📊 수치 근거</p>
                    <div className="flex flex-col gap-1.5">
                      {wp.evidence.map((ev, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60"
                        >
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{ev.label}</span>
                          <span
                            className={`text-[12px] font-black shrink-0 ${ev.highlight ? "" : "text-zinc-700 dark:text-zinc-200"}`}
                            style={ev.highlight ? { color: colors.bg } : undefined}
                          >
                            {ev.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 태그 */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  {wp.tags.map((tag) => (
                    <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                      {tag}
                    </span>
                  ))}
                  {wp.player && (
                    <span className="ml-auto text-[10px] text-zinc-300 dark:text-zinc-600 font-medium">자세히 →</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPlayer && (
        <PlayerDetailSheet player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </>
  );
}

const LEAGUE_COLORS = {
  WKBL: "#007B5F",
  KBL:  "#0B3D91",
} as const;

// ─── 탐색 탭 (진입점) ────────────────────────────────────────

export function ExploreTab({ onViewRoster }: { onViewRoster?: (teamId: string) => void }) {
  const [selected, setSelected] = useState<MatchWithId | null>(null);
  const [league, setLeague] = useState<"WKBL" | "KBL">("WKBL");

  if (selected) {
    return <MatchDetail match={selected} onBack={() => setSelected(null)} onViewRoster={onViewRoster} />;
  }

  const filtered = MATCHES.filter((m) => (m.match.league ?? "WKBL") === league);

  return (
    <>
      {/* 리그 탭 */}
      <div className="px-4 pt-4 pb-0 flex gap-2">
        {(["WKBL", "KBL"] as const).map((lg) => {
          const active = league === lg;
          return (
            <button
              key={lg}
              onClick={() => setLeague(lg)}
              className="px-4 py-2 rounded-full text-[12px] font-black transition-all"
              style={
                active
                  ? { backgroundColor: LEAGUE_COLORS[lg], color: "white" }
                  : { backgroundColor: "#f4f4f5", color: "#71717a" }
              }
            >
              {lg} {lg === "WKBL" ? "여자" : "남자"}
            </button>
          );
        })}
      </div>

      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-black text-zinc-900 dark:text-white">경기 목록</h1>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">경기를 눌러 관전 포인트를 확인하세요</p>
      </div>
      <Section>
        <div className="flex flex-col gap-4">
          {filtered.map((match) => (
            <MatchListCard
              key={match.id}
              match={match}
              onClick={() => setSelected(match)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-12">준비 중인 경기가 없습니다</p>
          )}
        </div>
      </Section>
    </>
  );
}
