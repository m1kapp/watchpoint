"use client";

import { useState } from "react";
import { MATCHES } from "@/lib/matches";
import { getTeamColor } from "@/lib/team-styles";
import { TagBadge, TeamBadge, AvatarCircle } from "@/components/ui-shared";
import { MatchHeader } from "@/components/match-header";
import { PlayerDetailSheet } from "@/components/player-detail-sheet";
import type { MatchPlayer, MatchData, Evidence, Source } from "@/lib/match-types";
import { SourceRow } from "@/components/source-chip";

type MatchWithId = MatchData & { id: string };

function buildWatchPoints(match: MatchWithId) {
  const points: {
    index: number;
    title: string;
    reason: string;
    evidence: Evidence[];
    sources: Source[];
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
      sources: coach.sources ?? [],
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
      sources: player.sources ?? [],
      team: player.team,
      tags: player.tags.slice(0, 2),
      player,
    });
  }

  return points;
}

export function WatchpointsTab() {
  const [selectedMatchId, setSelectedMatchId] = useState(MATCHES[0].id);
  const [selectedPlayer, setSelectedPlayer] = useState<MatchPlayer | null>(null);

  const currentMatch = MATCHES.find((m) => m.id === selectedMatchId) ?? MATCHES[0];
  const watchPoints = buildWatchPoints(currentMatch);

  return (
    <>
      {/* 경기 선택 */}
      <MatchSelector
        matches={MATCHES}
        selectedId={selectedMatchId}
        onSelect={setSelectedMatchId}
      />

      {/* 매치 헤더 */}
      <MatchHeader data={currentMatch} />

      {/* 관전 포인트 헤딩 */}
      <div className="px-4 mb-3">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          오늘의 관전 포인트
        </p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {watchPoints.length}가지 핵심 포인트
        </p>
      </div>

      <div className="px-4 flex flex-col gap-3 pb-6">
        {watchPoints.map((wp) => {
          const colors = getTeamColor(wp.team);
          const isNational = wp.player?.bio?.national_team?.is_national;

          return (
            <button
              key={wp.index}
              className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-transform"
              onClick={() => wp.player && setSelectedPlayer(wp.player)}
            >
              <div className="flex">
                <div className="w-1 shrink-0" style={{ backgroundColor: colors.bg }} />

                <div className="flex-1 px-4 py-4">
                  {/* 번호 + 팀 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black leading-none tabular-nums" style={{ color: colors.bg }}>
                      {String(wp.index).padStart(2, "0")}
                    </span>
                    <TeamBadge team={wp.team} />
                    {wp.isCoach && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                        감독
                      </span>
                    )}
                  </div>

                  {/* 타이틀 */}
                  <p className="text-[17px] font-black text-zinc-900 leading-snug mb-2">
                    {wp.title}
                  </p>

                  {/* 선수 / 감독 */}
                  {wp.player ? (
                    <div className="flex items-center gap-2 mb-3">
                      <AvatarCircle imageUrl={wp.player.imageUrl} name={wp.player.name} bgColor={colors.bg} size={24} />
                      <p className="text-xs font-semibold text-zinc-700">
                        {wp.player.name}{isNational && " 🇰🇷"}
                        <span className="text-zinc-400 font-normal ml-1">{wp.player.position} · {wp.player.height}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 mb-3">🧑‍💼 {wp.coachName} 감독</p>
                  )}

                  {/* 한줄 요약 */}
                  {wp.reason && (
                    <p className="text-xs text-zinc-500 leading-relaxed mb-3">{wp.reason}</p>
                  )}

                  {/* 📊 수치 근거 — 핵심 */}
                  {wp.evidence.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-zinc-400 mb-1.5">📊 수치 근거</p>
                      <div className="flex flex-col gap-1.5">
                        {wp.evidence.map((ev, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2"
                            style={{ backgroundColor: ev.highlight ? colors.light : "#f4f4f5" }}>
                            <span className="text-[11px] text-zinc-500">{ev.label}</span>
                            <span className="text-[12px] font-black shrink-0"
                              style={{ color: ev.highlight ? colors.bg : "#3f3f46" }}>
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
                      <TagBadge key={tag} tag={tag} />
                    ))}
                    {wp.player && (
                      <span className="ml-auto text-[10px] text-zinc-300 font-medium">자세히 →</span>
                    )}
                  </div>

                  {/* 출처 */}
                  {wp.sources.length > 0 && (
                    <SourceRow sources={wp.sources} />
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

function MatchSelector({ matches, selectedId, onSelect }: {
  matches: MatchWithId[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="px-4 pt-3 pb-2 overflow-x-auto scrollbar-none">
      <div className="flex gap-2 w-max">
        {matches.map((m) => {
          const isSelected = m.id === selectedId;
          const dateObj = new Date(m.match.date);
          const isToday = m.match.date === new Date().toISOString().slice(0, 10);
          const dateLabel = isToday ? "오늘" : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`flex flex-col gap-0.5 px-3.5 py-2.5 rounded-2xl border transition-all text-left shrink-0 ${
                isSelected ? "bg-zinc-900 border-zinc-900" : "bg-white border-zinc-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${isToday && !isSelected ? "text-emerald-500" : isSelected ? "text-zinc-400" : "text-zinc-400"}`}>
                  {dateLabel} {m.match.time}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                  {m.match.stage}
                </span>
              </div>
              <p className={`text-sm font-black leading-tight ${isSelected ? "text-white" : "text-zinc-900"}`}>
                {m.match.home}{" "}
                <span className={`font-normal text-xs ${isSelected ? "text-zinc-400" : "text-zinc-400"}`}>vs</span>{" "}
                {m.match.away}
              </p>
              <p className={`text-[10px] ${isSelected ? "text-zinc-500" : "text-zinc-400"}`}>
                📍 {m.match.location}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
