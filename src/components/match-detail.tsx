"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MATCHES, TAG_COLORS, TEAM_COLORS } from "@/lib/matches";
import { PLAYERS, TEAMS, getRosterId } from "@/lib/data";
import { MatchScoreCard } from "@/components/match-score-card";
import type { MatchData, MatchPlayer, Evidence } from "@/lib/match-types";

type MatchWithId = MatchData & { id: string };

// ─── 헬퍼 ────────────────────────────────────────────────────

const TEAM_NAME_TO_ID = Object.fromEntries(TEAMS.map((t) => [t.shortName, t.id]));

/** MatchPlayer 이름으로 PLAYERS에서 id 찾기 */
function findPlayerId(name: string): string | null {
  const p = PLAYERS.find((p) => p.name === name);
  return p?.id ?? null;
}

const REVIEW_STYLE = {
  적중:    { label: "✓ 적중",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  부분적중: { label: "△ 부분적중", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  빗나감:  { label: "✕ 빗나감",  cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
} as const;

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
    review?: { result: "적중" | "부분적중" | "빗나감"; summary: string };
  }[] = [];

  let idx = 1;
  for (const coach of match.coaches) {
    if (!coach.watch_point) continue;
    points.push({
      index: idx++,
      title: coach.watch_point,
      reason: coach.watch_reason,
      evidence: coach.evidence ?? [],
      team: coach.team,
      tags: coach.style,
      isCoach: true,
      coachName: coach.name,
      review: coach.review,
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
      review: player.review,
    });
  }
  return points.slice(0, 7);
}

// ─── MatchDetail ─────────────────────────────────────────────

export function MatchDetail({ match }: { match: MatchWithId }) {
  const router = useRouter();
  const [openWp, setOpenWp] = useState<number | null>(null);
  const { match: m, teams } = match;
  const homeColors = TEAM_COLORS[m.home] ?? { bg: "#333", light: "#f4f4f5" };
  const awayColors = TEAM_COLORS[m.away] ?? { bg: "#333", light: "#f4f4f5" };
  const watchPoints = buildWatchPoints(match);
  const home = teams.find((t) => t.name === m.home);
  const away = teams.find((t) => t.name === m.away);

  return (
    <>
      {/* 매치 헤더 */}
      <div className="px-4 mt-2 mb-4">
        <MatchScoreCard
          stage={m.stage}
          date={m.date}
          time={m.time}
          location={m.location}
          home={m.home}
          away={m.away}
          homeInfo={{ name: m.home, rank: home?.rank }}
          awayInfo={{ name: m.away, rank: away?.rank }}
          score={m.score ?? null}
          homeExtra={
            (() => { const rid = getRosterId(TEAM_NAME_TO_ID[m.home], "2025-26"); return rid ? (
              <Link
                href={`/roster/${rid}`}
                className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: homeColors.bg, backgroundColor: `${homeColors.bg}15` }}
              >
                로스터 보기 →
              </Link>
            ) : undefined; })()
          }
          awayExtra={
            (() => { const rid = getRosterId(TEAM_NAME_TO_ID[m.away], "2025-26"); return rid ? (
              <Link
                href={`/roster/${rid}`}
                className="self-end text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: awayColors.bg, backgroundColor: `${awayColors.bg}15` }}
              >
                로스터 보기 →
              </Link>
            ) : undefined; })()
          }
        />
      </div>

      {/* 관전 포인트 */}
      <div className="px-4 mb-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">관전 포인트</p>
          <p className="text-[11px] text-zinc-400">{watchPoints.length}개</p>
        </div>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
          AI가 경기 전 기사·데이터를 분석해 작성 — 예측이 빗나갈 수 있습니다.
        </p>
      </div>

      <div className="px-4 pb-6">
        <div
          className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800"
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07)" }}
        >
          {watchPoints.map((wp) => {
            const colors = TEAM_COLORS[wp.team] ?? { bg: "#333", text: "white", light: "#f4f4f5" };
            const isNational = wp.player?.bio?.national_team?.is_national;
            const isOpen = openWp === wp.index;
            const playerId = wp.player ? findPlayerId(wp.player.name) : null;

            return (
              <div key={wp.index}>
                <button
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors"
                  onClick={() => setOpenWp(isOpen ? null : wp.index)}
                >
                  <span className="text-sm font-black tabular-nums leading-none shrink-0 w-5 text-right" style={{ color: colors.bg }}>
                    {String(wp.index).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[14px] font-black text-zinc-900 dark:text-white leading-snug text-left">
                    {wp.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {wp.review && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${REVIEW_STYLE[wp.review.result].cls}`}>
                        {REVIEW_STYLE[wp.review.result].label}
                      </span>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      className={`text-zinc-300 dark:text-zinc-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 mt-3 mb-2.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: colors.bg }}>
                        {wp.team}
                      </span>
                      {wp.isCoach ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          감독 {wp.coachName}
                        </span>
                      ) : wp.player && (
                        <button
                          className="flex items-center gap-1 active:opacity-60 transition-opacity cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (playerId) router.push(`/players/${playerId}`);
                          }}
                        >
                          {wp.player.imageUrl ? (
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                              <Image src={wp.player.imageUrl} alt={wp.player.name} width={20} height={20} className="w-full h-full object-cover object-top" unoptimized />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0" style={{ backgroundColor: colors.bg }}>
                              {wp.player.name[0]}
                            </div>
                          )}
                          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 underline decoration-dotted underline-offset-2">
                            {wp.player.name}{isNational && " 🇰🇷"}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-0.5">{wp.player.position}</span>
                        </button>
                      )}
                    </div>

                    {wp.reason && (
                      <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">{wp.reason}</p>
                    )}

                    {wp.evidence.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-3">
                        {wp.evidence.map((ev, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60">
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
                    )}

                    {wp.review && (
                      <div className={`rounded-xl px-3 py-2.5 ${
                        wp.review.result === "적중"    ? "bg-emerald-50 dark:bg-emerald-900/20" :
                        wp.review.result === "부분적중" ? "bg-amber-50 dark:bg-amber-900/20" :
                                                          "bg-red-50 dark:bg-red-900/20"
                      }`}>
                        <p className={`text-[10px] font-black mb-1 ${
                          wp.review.result === "적중"    ? "text-emerald-600 dark:text-emerald-400" :
                          wp.review.result === "부분적중" ? "text-amber-600 dark:text-amber-400" :
                                                            "text-red-500 dark:text-red-400"
                        }`}>
                          {REVIEW_STYLE[wp.review.result].label} — 경기 후 리뷰
                        </p>
                        <p className="text-[12px] text-zinc-600 dark:text-zinc-300 leading-relaxed">{wp.review.summary}</p>
                      </div>
                    )}

                    {wp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {wp.tags.map((tag) => (
                          <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

