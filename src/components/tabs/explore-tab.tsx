"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Section } from "@m1kapp/ui";
import { MATCHES, TAG_COLORS, TEAM_COLORS, TEAM_LOGOS } from "@/lib/matches";
import { TEAMS } from "@/lib/data";
import scoresJson from "../../../data/wkbl/scores.json";
import { PlayerDetailSheet } from "@/components/player-detail-sheet";
import { BracketView } from "@/components/bracket-view";
import { DropdownSelector } from "@/components/dropdown-selector";
import { MatchScoreCard } from "@/components/match-score-card";
import type { MatchData, MatchPlayer, Evidence } from "@/lib/match-types";

type MatchWithId = MatchData & { id: string };

// ─── 경기 목록 ───────────────────────────────────────────────

function MatchListCard({ match, onClick }: { match: MatchWithId; onClick: () => void }) {
  const { match: m, teams, players, coaches, cancelled, cancelReason } = match;
  const home = teams.find((t) => t.name === m.home);
  const away = teams.find((t) => t.name === m.away);
  const wpCount =
    (coaches ?? []).filter((c) => c.watch_point).length +
    players.filter((p) => p.featured && p.watch_point).length;
  const hasWatchPoints = wpCount > 0;

  return (
    <div className={cancelled ? "opacity-50" : undefined}>
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
        headerRight={
          cancelled ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M4.9 4.9l14.2 14.2"/>
              </svg>
              경기 취소
            </span>
          ) : hasWatchPoints ? (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black cursor-pointer"
              style={{ backgroundColor: `${WKBL_COLOR}18`, color: WKBL_COLOR }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: WKBL_COLOR }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: WKBL_COLOR }} />
              </span>
              관전포인트 {wpCount}
            </span>
          ) : undefined
        }
        onClick={cancelled || !hasWatchPoints ? undefined : onClick}
      />
      {cancelled && cancelReason && (
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 pl-1">{cancelReason}</p>
      )}
    </div>
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

// 경기 팀명(TN shortName) → teamId (TEAMS 기반)
const TEAM_NAME_TO_ID = Object.fromEntries(
  TEAMS.map((t) => [t.shortName, t.id])
);

const REVIEW_STYLE = {
  적중:    { label: "✓ 적중",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  부분적중: { label: "△ 부분적중", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  빗나감:  { label: "✕ 빗나감",  cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
} as const;

function MatchDetail({ match, onBack, onViewRoster }: {
  match: MatchWithId;
  onBack: () => void;
  onViewRoster?: (teamId: string) => void;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<MatchPlayer | null>(null);
  const [openWp, setOpenWp] = useState<number | null>(null);
  const { match: m, teams } = match;
  const homeColors = TEAM_COLORS[m.home] ?? { bg: "#333", light: "#f4f4f5" };
  const awayColors = TEAM_COLORS[m.away] ?? { bg: "#333", light: "#f4f4f5" };
  const watchPoints = buildWatchPoints(match);
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
            onViewRoster && TEAM_NAME_TO_ID[m.home] ? (
              <button onClick={() => onViewRoster(TEAM_NAME_TO_ID[m.home])}
                className="self-start text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: homeColors.bg, backgroundColor: `${homeColors.bg}15` }}>
                로스터 보기 →
              </button>
            ) : undefined
          }
          awayExtra={
            onViewRoster && TEAM_NAME_TO_ID[m.away] ? (
              <button onClick={() => onViewRoster(TEAM_NAME_TO_ID[m.away])}
                className="self-end text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: awayColors.bg, backgroundColor: `${awayColors.bg}15` }}>
                로스터 보기 →
              </button>
            ) : undefined
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

            return (
              <div key={wp.index}>
                {/* 헤더 — 항상 노출 */}
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
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      className={`text-zinc-300 dark:text-zinc-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {/* 바디 — 열릴 때만 */}
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
                          className="flex items-center gap-1 active:opacity-60 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); setSelectedPlayer(wp.player!); }}
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
                        wp.review.result === "적중"     ? "bg-emerald-50 dark:bg-emerald-900/20" :
                        wp.review.result === "부분적중"  ? "bg-amber-50 dark:bg-amber-900/20" :
                                                           "bg-red-50 dark:bg-red-900/20"
                      }`}>
                        <p className={`text-[10px] font-black mb-1 ${
                          wp.review.result === "적중"     ? "text-emerald-600 dark:text-emerald-400" :
                          wp.review.result === "부분적중"  ? "text-amber-600 dark:text-amber-400" :
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

      {selectedPlayer && (
        <PlayerDetailSheet player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </>
  );
}

const WKBL_COLOR = "#007B5F";
const SEASONS = ["2025-26", "2024-25", "2023-24", "2022-23"];

type StageFilter = "플레이오프" | "정규시즌";

function getStageType(stage: string): StageFilter {
  if (stage.includes("플레이오프") || stage.includes("챔피언") || stage.includes("준플레이오프")) {
    return "플레이오프";
  }
  return "정규시즌";
}

// ─── 정규시즌 경기 카드 ──────────────────────────────────────

type ScoreGame = typeof scoresJson[number];

function RegularSeasonList({ games }: { games: ScoreGame[] }) {
  const TEAM_RANKS = Object.fromEntries(
    TEAMS.filter((t) => t.league === "WKBL").map((t) => [t.shortName, t.rank])
  );

  // 월별 그룹
  const byMonth: Record<string, ScoreGame[]> = {};
  for (const g of games) {
    const month = g.date.slice(0, 7);
    (byMonth[month] ??= []).push(g);
  }
  const months = Object.keys(byMonth).sort().reverse();

  return (
    <Section>
      <div className="flex flex-col gap-6 pt-4">
        {months.map((month) => (
          <div key={month}>
            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 px-1 mb-2">
              {month.replace("-", "년 ")}월
            </p>
            <div className="flex flex-col gap-3">
              {byMonth[month].map((g) => (
                <MatchScoreCard
                  key={g.gameId}
                  stage="정규시즌"
                  date={g.date}
                  time={g.time}
                  location={g.stadium}
                  home={g.home}
                  away={g.away}
                  homeInfo={{ name: g.home, rank: TEAM_RANKS[g.home] }}
                  awayInfo={{ name: g.away, rank: TEAM_RANKS[g.away] }}
                  score={g.homeScore != null ? { home: g.homeScore, away: g.awayScore } : null}
                  isLive={g.status === "live"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── 탐색 탭 (진입점) ────────────────────────────────────────

export function ExploreTab({ onViewRoster }: { onViewRoster?: (teamId: string) => void }) {
  const [selected, setSelected] = useState<MatchWithId | null>(null);
  const [season, setSeason] = useState("2025-26");
  const [stage, setStage] = useState<StageFilter>("플레이오프");
  const [gameFilter, setGameFilter] = useState<"all" | "upcoming">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "bracket">("list");

  if (selected) {
    return <MatchDetail match={selected} onBack={() => setSelected(null)} onViewRoster={onViewRoster} />;
  }

  const today = new Date().toISOString().slice(0, 10);

  // 정규시즌: scores.json 기반
  const regularGames = scoresJson
    .filter((g) => g.date < "2026-04") // 4월 이후는 플레이오프
    .sort((a, b) => b.date.localeCompare(a.date));

  // 플레이오프: matches.json 기반
  const filtered = MATCHES
    .filter((m) => getStageType(m.match.stage) === "플레이오프")
    .filter((m) => gameFilter === "upcoming" ? (m.match.date >= today && !m.cancelled) : true);

  return (
    <>
      {/* 구분 | 시즌 셀렉터 */}
      <div className="px-4 pt-4 pb-0 flex items-stretch gap-2">
        <DropdownSelector
          label="구분"
          value={`WKBL ${stage}`}
          options={[
            { key: "플레이오프", label: "WKBL 플레이오프" },
            { key: "정규시즌",   label: "WKBL 정규시즌" },
          ]}
          onSelect={(k) => { setStage(k as StageFilter); setViewMode("list"); }}
          accentColor={WKBL_COLOR}
        />
        <DropdownSelector
          label="시즌"
          value={season}
          options={SEASONS.map((s) => ({ key: s, label: s, disabled: s !== "2025-26" }))}
          onSelect={setSeason}
        />
      </div>

      {stage === "정규시즌" ? (
        <RegularSeasonList games={regularGames} />
      ) : (
        <>
          {/* 필터 바 */}
          <div className="px-4 pt-3 pb-0 flex items-center justify-between">
            <div className={`flex items-center gap-1.5 transition-opacity ${viewMode === "bracket" ? "opacity-0 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5">
                {(["all", "upcoming"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setGameFilter(f)}
                    className="px-3 py-1 rounded-full text-[11px] font-bold transition-all"
                    style={gameFilter === f
                      ? { backgroundColor: "white", color: "#18181b", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                      : { color: "#71717a" }}
                  >
                    {f === "all" ? "모든경기" : "예정경기"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center justify-center w-7 h-7 rounded-full transition-all"
                style={viewMode === "list"
                  ? { backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : {}}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={viewMode === "list" ? "#18181b" : "#71717a"} strokeWidth={2.5} strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("bracket")}
                className="flex items-center justify-center w-7 h-7 rounded-full transition-all"
                style={viewMode === "bracket"
                  ? { backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                  : {}}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={viewMode === "bracket" ? "#18181b" : "#71717a"} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="6" height="4" rx="1" /><rect x="2" y="17" width="6" height="4" rx="1" />
                  <rect x="16" y="10" width="6" height="4" rx="1" />
                  <path d="M8 5h4v14H8M12 12h4" />
                </svg>
              </button>
            </div>
          </div>

          {viewMode === "bracket" ? (
            <BracketView
              matches={MATCHES.filter((m) => getStageType(m.match.stage) === "플레이오프")}
              onMatchClick={(m) => setSelected(m)}
            />
          ) : (
            <Section>
              <div className="flex flex-col gap-4 pt-4">
                {filtered.map((match) => (
                  <MatchListCard key={match.id} match={match} onClick={() => setSelected(match)} />
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-12">준비 중인 경기가 없습니다</p>
                )}
              </div>
            </Section>
          )}
        </>
      )}
    </>
  );
}
