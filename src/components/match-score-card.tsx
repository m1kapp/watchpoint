"use client";

import { getTeamColor, getTeamLogo, formatMatchDate, CARD_SHADOW } from "@/lib/team-styles";
import type { ReactNode } from "react";

interface TeamInfo {
  name: string;
  rank?: number;
  summary?: string;
}

interface Score {
  home: number;
  away: number;
}

interface MatchScoreCardProps {
  stage: string;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:MM:SS"
  location: string;
  home: string;       // team name
  away: string;       // team name
  homeInfo?: TeamInfo;
  awayInfo?: TeamInfo;
  score?: Score | null;
  /** 홈팀 박스 하단 추가 콘텐츠 */
  homeExtra?: ReactNode;
  /** 어웨이팀 박스 하단 추가 콘텐츠 */
  awayExtra?: ReactNode;
  /** true면 카드 전체를 button으로 감쌈 */
  onClick?: () => void;
  /** 우측 헤더 보조 텍스트 */
  headerRight?: ReactNode;
  /** 라이브 경기 여부 */
  isLive?: boolean;
}

export function MatchScoreCard({
  stage,
  date,
  time,
  location,
  home,
  away,
  homeInfo,
  awayInfo,
  score,
  homeExtra,
  awayExtra,
  onClick,
  headerRight,
  isLive,
}: MatchScoreCardProps) {
  const homeColors = getTeamColor(home);
  const awayColors = getTeamColor(away);
  const homeLogo = getTeamLogo(home);
  const awayLogo = getTeamLogo(away);

  const { isToday, dateLabel } = formatMatchDate(date, time);

  // 상태 태그
  const statusTag = isLive
    ? { label: "LIVE", cls: "text-red-500", pulse: true }
    : isToday && score == null
    ? { label: "오늘", cls: "text-emerald-500", pulse: false }
    : null;

  const inner = (
    <>
      {/* 헤더 — 스테이지 + 보조 */}
      <div className="px-4 pt-3.5 pb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
          {stage.replace(/\s*\([^)]*\)/, "")}
        </span>
        {headerRight}
      </div>

      {/* VS 구역 */}
      <div className="flex items-stretch px-3 pb-3 gap-2">
        {/* 홈팀 */}
        <div className="flex-1 flex flex-col justify-center gap-2 rounded-xl px-3 py-3"
          style={{ backgroundColor: `${homeColors.bg}0f` }}>
          <div className="flex items-center gap-2.5">
            {homeLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={homeLogo} alt={home} className="w-10 h-10 object-contain shrink-0" />
            )}
            <div className="min-w-0">
              {homeInfo?.rank != null && (
                <span className="text-[10px] font-black block" style={{ color: homeColors.bg }}>{homeInfo.rank}위</span>
              )}
              <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight truncate">{home}</p>
            </div>
          </div>
          {homeExtra}
        </div>

        {/* 중앙 — 스코어 + 장소 */}
        <div className="flex flex-col items-center justify-center gap-1 w-24 shrink-0">
          {statusTag && (
            <span className={`flex items-center gap-1 text-[9px] font-black tracking-tight ${statusTag.cls}`}>
              {statusTag.pulse && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
              )}
              {statusTag.label}
            </span>
          )}
          <span className="text-[9px] font-semibold tracking-tighter text-zinc-400 dark:text-zinc-500">
            {dateLabel}
          </span>
          <div className="flex items-center gap-1 mt-1">
            {score ? (
              <>
                <span className="text-2xl font-black tabular-nums tracking-tighter leading-none"
                  style={{ color: score.home >= score.away ? homeColors.bg : "#a1a1aa" }}>
                  {score.home}
                </span>
                <span className="text-sm font-black text-zinc-300 dark:text-zinc-600 leading-none">:</span>
                <span className="text-2xl font-black tabular-nums tracking-tighter leading-none"
                  style={{ color: score.away > score.home ? awayColors.bg : "#a1a1aa" }}>
                  {score.away}
                </span>
              </>
            ) : (
              <span className="text-sm font-black tracking-tighter text-zinc-300 dark:text-zinc-600">VS</span>
            )}
          </div>
          <span className="text-[9px] tracking-tighter text-zinc-400 dark:text-zinc-500 mt-1">
            📍 {location.replace(/실내체육관|체육관/, "")}
          </span>
        </div>

        {/* 어웨이팀 */}
        <div className="flex-1 flex flex-col justify-center gap-2 rounded-xl px-3 py-3"
          style={{ backgroundColor: `${awayColors.bg}0f` }}>
          <div className="flex items-center gap-2.5 flex-row-reverse">
            {awayLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={awayLogo} alt={away} className="w-10 h-10 object-contain shrink-0" />
            )}
            <div className="min-w-0 text-right">
              {awayInfo?.rank != null && (
                <span className="text-[10px] font-black block" style={{ color: awayColors.bg }}>{awayInfo.rank}위</span>
              )}
              <p className="text-sm font-black text-zinc-900 dark:text-white leading-tight truncate">{away}</p>
            </div>
          </div>
          {awayExtra}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
        style={{ boxShadow: CARD_SHADOW }}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden"
      style={{ boxShadow: CARD_SHADOW }}>
      {inner}
    </div>
  );
}
