"use client";

import { useState } from "react";
import { Section } from "@m1kapp/ui";
import { MATCHES } from "@/lib/matches";
import { getTeamColor, CARD_SHADOW } from "@/lib/team-styles";
import { TeamBadge, AvatarCircle } from "@/components/ui-shared";
import type { MatchData, MatchPlayer, Coach, ReviewResult } from "@/lib/match-types";

type MatchWithId = MatchData & { id: string };

// ─── 리뷰 배지 ───────────────────────────────────────────────

const REVIEW_STYLE: Record<ReviewResult, { label: string; cls: string }> = {
  적중:    { label: "✓ 적중",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  부분적중: { label: "△ 부분적중", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  빗나감:  { label: "✕ 빗나감",  cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

function ReviewBadge({ result }: { result: ReviewResult }) {
  const s = REVIEW_STYLE[result];
  return (
    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── 관전포인트 리뷰 카드 ─────────────────────────────────────

function WatchReviewCard({
  index,
  team,
  title,
  reason,
  review,
  player,
  isCoach,
  coachName,
}: {
  index: number;
  team: string;
  title: string;
  reason: string;
  review?: { result: ReviewResult; summary: string };
  player?: MatchPlayer;
  isCoach?: boolean;
  coachName?: string;
}) {
  const colors = getTeamColor(team);

  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden"
      style={{ boxShadow: CARD_SHADOW }}
    >
      {/* 상단 — 예측 */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-black tabular-nums leading-none" style={{ color: colors.bg }}>
            {String(index).padStart(2, "0")}
          </span>
          <TeamBadge team={team} />
          {isCoach && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              감독
            </span>
          )}
        </div>

        {/* 선수/감독 */}
        {player && (
          <div className="flex items-center gap-2 mb-2">
            <AvatarCircle imageUrl={player.imageUrl} name={player.name} bgColor={colors.bg} size={24} />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {player.name}
              <span className="text-zinc-400 font-normal ml-1">{player.position} · {player.height}</span>
            </p>
          </div>
        )}
        {isCoach && coachName && (
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">감독 {coachName}</p>
        )}

        <p className="text-[16px] font-black text-zinc-900 dark:text-white leading-snug mb-1">{title}</p>
        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{reason}</p>
      </div>

      {/* 구분선 */}
      <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-4" />

      {/* 하단 — 결과 리뷰 */}
      <div className="px-4 py-3">
        {review ? (
          <div className="flex flex-col gap-1.5">
            <ReviewBadge result={review.result} />
            <p className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-relaxed">{review.summary}</p>
          </div>
        ) : (
          <p className="text-[11px] text-zinc-300 dark:text-zinc-600 italic">경기 후 리뷰 준비 중</p>
        )}
      </div>
    </div>
  );
}

// ─── 경기별 리뷰 섹션 ─────────────────────────────────────────

function MatchReviewSection({ match }: { match: MatchWithId }) {
  const { match: m, coaches, players } = match;
  const homeColors = getTeamColor(m.home);
  const awayColors = getTeamColor(m.away);

  const cards: React.ReactNode[] = [];
  let idx = 1;

  for (const coach of coaches) {
    cards.push(
      <WatchReviewCard
        key={`coach-${coach.name}`}
        index={idx++}
        team={coach.team}
        title={coach.watch_point}
        reason={coach.watch_reason}
        review={coach.review}
        isCoach
        coachName={coach.name}
      />
    );
  }
  for (const player of players) {
    if (!player.featured || !player.watch_point) continue;
    cards.push(
      <WatchReviewCard
        key={`player-${player.name}`}
        index={idx++}
        team={player.team}
        title={player.watch_point}
        reason={player.watch_reason ?? ""}
        review={player.review}
        player={player}
      />
    );
  }

  if (cards.length === 0) return null;

  // 적중률 계산
  const reviewed = [...coaches, ...players.filter((p) => p.featured && p.watch_point)]
    .filter((wp) => wp.review);
  const hits = reviewed.filter((wp) => wp.review?.result === "적중").length;
  const partial = reviewed.filter((wp) => wp.review?.result === "부분적중").length;
  const total = reviewed.length;

  return (
    <div className="mb-6">
      {/* 경기 헤더 */}
      <div className="px-4 mb-3">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{m.stage}</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: homeColors.bg }} />
            <span className="text-sm font-black text-zinc-900 dark:text-white">{m.home}</span>
          </div>
          {m.score && (
            <span className="text-sm font-black tabular-nums text-zinc-900 dark:text-white">
              {m.score.home} – {m.score.away}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-zinc-900 dark:text-white">{m.away}</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: awayColors.bg }} />
          </div>
          {total > 0 && (
            <span className="ml-auto text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
              적중 {hits}{partial > 0 ? `+${partial}` : ""}/{total}
            </span>
          )}
        </div>
      </div>

      <Section>
        <div className="flex flex-col gap-3">
          {cards}
        </div>
      </Section>
    </div>
  );
}

// ─── 리뷰 탭 진입점 ───────────────────────────────────────────

export function ReviewTab() {
  const finishedMatches = MATCHES.filter(
    (m) => m.match.score !== undefined && !m.cancelled
  );

  const totalWPs = finishedMatches.flatMap((m) => [
    ...m.coaches,
    ...m.players.filter((p) => p.featured && p.watch_point),
  ]);
  const reviewedWPs = totalWPs.filter((wp) => wp.review);
  const hitCount = reviewedWPs.filter((wp) => wp.review?.result === "적중").length;
  const partialCount = reviewedWPs.filter((wp) => wp.review?.result === "부분적중").length;

  return (
    <>
      {/* 요약 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">관전 포인트 리뷰</p>
        <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">예측은 맞았을까?</p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">
          경기 전 AI가 기사·데이터를 기반으로 잡은 관전 포인트가 실제 경기에서 어떻게 결론났는지 확인합니다.
        </p>
        {reviewedWPs.length > 0 && (
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">✓ 적중 {hitCount}</span>
            <span className="text-[12px] font-bold text-amber-600 dark:text-amber-400">△ 부분 {partialCount}</span>
            <span className="text-[12px] font-bold text-red-500 dark:text-red-400">✕ 빗나감 {reviewedWPs.length - hitCount - partialCount}</span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-auto">총 {reviewedWPs.length}개 리뷰</span>
          </div>
        )}
      </div>

      {finishedMatches.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-16">종료된 경기가 없습니다</p>
      ) : (
        finishedMatches.map((match) => (
          <MatchReviewSection key={match.id} match={match} />
        ))
      )}

      <div className="h-6" />
    </>
  );
}
