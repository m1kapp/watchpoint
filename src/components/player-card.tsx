"use client";

import Image from "next/image";
import type { Player } from "@/lib/types";
import { TEAMS } from "@/lib/data";
import { getTeamLogo } from "@/lib/team-styles";
import { positionLabel } from "@/lib/utils";
import { TagBadge } from "@/components/ui-shared";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const { name, position, height, number, team, teamId, imageUrl, bio, tags } = player;
  const { age, career_year, birth_year, national_team } = bio;
  const visibleTags = tags.slice(0, 3);
  const teamColor = TEAMS.find((t) => t.id === teamId)?.color ?? "#6b7280";
  const teamLogo = getTeamLogo(team);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 active:scale-[0.98] transition-transform overflow-hidden"
    >
      <div className="flex items-stretch gap-0">
        {/* 프로필 이미지 */}
        <div className="w-16 self-stretch shrink-0 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={64}
              height={64}
              className="w-full h-full object-cover object-top"
              unoptimized
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-black text-lg"
              style={{ backgroundColor: teamColor }}
            >
              {name[0]}
            </div>
          )}
          {/* 포지션 뱃지 */}
          <div
            className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-black text-white py-0.5"
            style={{ backgroundColor: `${teamColor}cc` }}
          >
            {positionLabel(position)}
          </div>
        </div>

        {/* 텍스트 영역 */}
        <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-black text-zinc-900 dark:text-white leading-none">{name}</p>
            {national_team.is_national && (
              <span className="text-xs leading-none">🇰🇷</span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 tabular-nums">
            {[height, age ? `만 ${age}세` : null, birth_year ? `${String(birth_year).slice(-2)}년생` : null, career_year ? `${career_year}년차` : null].filter(Boolean).join(" · ")}
          </p>
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {visibleTags.map((tag) => (
                <TagBadge key={tag} tag={tag} size="xs" />
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600 py-0.5">+{tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* 팀 로고 + 등번호 */}
        <div
          className="w-14 shrink-0 flex flex-col items-center justify-center gap-1.5 border-l border-zinc-100 dark:border-zinc-800"
          style={{ backgroundColor: `${teamColor}0d` }}
        >
          {teamLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={teamLogo} alt={team} className="w-7 h-7 object-contain opacity-50" />
          )}
          <span
            className="text-2xl font-black tabular-nums leading-none"
            style={{ color: teamColor }}
          >
            {number}
          </span>
        </div>
      </div>
    </button>
  );
}
