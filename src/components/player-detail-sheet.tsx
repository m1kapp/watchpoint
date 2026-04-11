"use client";

import Image from "next/image";
import type { MatchPlayer } from "@/lib/match-types";
import { TAG_COLORS, TEAM_COLORS, TEAM_LOGOS } from "@/lib/matches";

interface PlayerDetailSheetProps {
  player: MatchPlayer;
  onClose: () => void;
}

function StatRow({ label, current, prev, diff }: {
  label: string; current: number; prev: number; diff: number;
}) {
  const up = diff > 0;
  const noChange = diff === 0;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 w-10">{label}</span>
      <span className="text-sm font-black text-zinc-900 dark:text-white tabular-nums">{current}</span>
      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">{prev}</span>
      <span className={`text-[11px] font-bold w-12 text-right tabular-nums ${noChange ? "text-zinc-300 dark:text-zinc-600" : up ? "text-emerald-500" : "text-red-500"}`}>
        {noChange ? "−" : `${up ? "↑" : "↓"}${Math.abs(diff).toFixed(1)}`}
      </span>
    </div>
  );
}

export function PlayerDetailSheet({ player, onClose }: PlayerDetailSheetProps) {
  const {
    name, position, height, imageUrl, bio,
    stat_summary, stats, stat_diff,
    career_highlights, draft, career_seasons,
    tags, description, watch_point, team,
  } = player;
  const colors = TEAM_COLORS[team] ?? { bg: "#333", text: "white", light: "#f4f4f5" };
  const teamLogo = TEAM_LOGOS[team];
  const isNational = bio?.national_team?.is_national;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-t-2xl pb-8 shadow-2xl overflow-y-auto max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 팀 컬러 상단 바 */}
        <div className="h-1 w-full sticky top-0" style={{ backgroundColor: colors.bg }} />

        {/* 팀 로고 워터마크 */}
        {teamLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teamLogo}
            alt={team}
            aria-hidden
            className="absolute top-4 right-5 w-16 h-16 object-contain opacity-[0.07] pointer-events-none select-none"
          />
        )}

        <div className="px-5 pt-4">
          {/* 드래그 핸들 */}
          <div className="w-8 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />

          {/* 선수 헤더 */}
          <div className="flex items-center gap-4 mb-4">
            {imageUrl ? (
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0" style={{ boxShadow: `0 0 0 2.5px ${colors.bg}` }}>
                <Image src={imageUrl} alt={name} width={56} height={56} className="w-full h-full object-cover object-top" unoptimized />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0" style={{ backgroundColor: colors.bg }}>
                {name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">{name}</h2>
                {isNational && <span className="text-base">🇰🇷</span>}
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 tabular-nums">
                {position} · {height}{bio ? ` · 만 ${bio.age}세 · ${bio.career_year}년차` : ""}
              </p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-black px-2 py-0.5 rounded text-white" style={{ backgroundColor: colors.bg }}>
                {teamLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamLogo} alt="" aria-hidden className="w-2.5 h-2.5 object-contain brightness-0 invert" />
                )}
                {team}
              </span>
            </div>
          </div>

          {description && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">{description}</p>
          )}

          {/* 국가대표 */}
          {isNational && bio?.national_team && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2.5 mb-4 flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">🇰🇷 {bio.national_team.level ?? "국가대표"}</p>
              <span className="text-lg">🏅</span>
            </div>
          )}

          {/* 드래프트 */}
          {draft && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">드래프트</p>
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: colors.light }}>
                  <p className="text-[10px] text-zinc-500 mb-0.5">연도</p>
                  <p className="text-sm font-black" style={{ color: colors.bg }}>{draft.year}년</p>
                </div>
                <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: colors.light }}>
                  <p className="text-[10px] text-zinc-500 mb-0.5">라운드</p>
                  <p className="text-sm font-black" style={{ color: colors.bg }}>{draft.round}라운드</p>
                </div>
                <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: colors.light }}>
                  <p className="text-[10px] text-zinc-500 mb-0.5">순번</p>
                  <p className="text-sm font-black" style={{ color: colors.bg }}>{draft.pick}순위</p>
                </div>
              </div>
            </div>
          )}

          {/* 커리어 하이라이트 수상 */}
          {career_highlights && career_highlights.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">수상 · 기록</p>
              <div className="flex flex-wrap gap-1.5">
                {career_highlights.map((h, i) => (
                  <span key={i} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${h.type === "award" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                    {h.type === "award" ? "🏆 " : "📊 "}{h.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 커리어 시즌 기록 */}
          {career_seasons && career_seasons.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">시즌별 커리어</p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 w-16">시즌</span>
                  <span className="text-[10px] font-bold text-zinc-400 w-6 text-center">G</span>
                  <span className="text-[10px] font-bold text-zinc-400 flex-1 text-center">득점</span>
                  <span className="text-[10px] font-bold text-zinc-400 flex-1 text-center">리바</span>
                  <span className="text-[10px] font-bold text-zinc-400 flex-1 text-center">어시</span>
                </div>
                {career_seasons.map((s, i) => {
                  const isCurrent = i === 0;
                  return (
                    <div key={s.season} className={`flex items-center px-3 py-2.5 ${i !== career_seasons!.length - 1 ? "border-b border-zinc-50 dark:border-zinc-800/50" : ""} ${isCurrent ? "" : ""}`}>
                      <div className="w-16">
                        <p className={`text-[11px] font-bold tabular-nums ${isCurrent ? "" : "text-zinc-500 dark:text-zinc-400"}`} style={isCurrent ? { color: colors.bg } : {}}>
                          {s.season}
                        </p>
                        {s.note && (
                          <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">🏆 {s.note}</p>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 w-6 text-center tabular-nums">{s.games}</span>
                      <span className={`text-[12px] font-black flex-1 text-center tabular-nums ${isCurrent ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                        {s.points}
                      </span>
                      <span className={`text-[12px] font-black flex-1 text-center tabular-nums ${isCurrent ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                        {s.rebounds}
                      </span>
                      <span className={`text-[12px] font-black flex-1 text-center tabular-nums ${isCurrent ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                        {s.assists}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 이번 시즌 vs 지난 시즌 */}
          {stats && stat_diff && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">시즌 비교</p>
                <div className="flex gap-4 text-[10px] text-zinc-400 dark:text-zinc-600">
                  <span>이번</span><span>지난</span><span className="w-12 text-right">변화</span>
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl px-4 py-3 flex flex-col gap-2.5 border border-zinc-100 dark:border-zinc-800">
                <StatRow label="득점" current={stats.current_season.points} prev={stats.previous_season.points} diff={stat_diff.points} />
                <StatRow label="리바" current={stats.current_season.rebounds} prev={stats.previous_season.rebounds} diff={stat_diff.rebounds} />
                <StatRow label="어시" current={stats.current_season.assists} prev={stats.previous_season.assists} diff={stat_diff.assists} />
              </div>
            </div>
          )}

          {/* 태그 */}
          {tags.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">특성</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 관전 포인트 */}
          {watch_point && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: `${colors.bg}18` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.bg }} className="shrink-0">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.bg }}>관전 포인트</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{watch_point}</p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm font-semibold active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
