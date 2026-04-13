"use client";

import type { Coach } from "@/lib/match-types";
import { getTeamColor, getTeamLogo } from "@/lib/team-styles";
import { EyeIcon } from "@/components/ui-shared";

interface CoachCardProps {
  coach: Coach;
}

export function CoachCard({ coach }: CoachCardProps) {
  const { name, team, career_year, style, story, watch_point } = coach;
  const colors = getTeamColor(team);
  const logo = getTeamLogo(team);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
      <div className="p-4">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shrink-0"
            style={{ backgroundColor: logo ? colors.light : colors.bg }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={team} className="w-7 h-7 object-contain" />
            ) : (
              name[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-black text-zinc-900 dark:text-white leading-none">{name}</p>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: colors.bg }}>
                {team}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">감독 · {career_year}년차</p>
          </div>
        </div>

        {/* 스타일 태그 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {style.map((s) => (
            <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.light, color: colors.bg }}>
              {s}
            </span>
          ))}
        </div>

        {/* 스토리 */}
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">{story}</p>

        {/* 관전 포인트 */}
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
          <EyeIcon size={11} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
          <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">{watch_point}</p>
        </div>
      </div>
    </div>
  );
}
