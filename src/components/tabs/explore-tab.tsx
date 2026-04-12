"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Section } from "@m1kapp/ui";
import { MATCHES, TEAM_COLORS } from "@/lib/matches";
import { TEAMS } from "@/lib/data";
import scoresJson from "../../../data/wkbl/scores.json";
import { BracketView } from "@/components/bracket-view";
import { DropdownSelector } from "@/components/dropdown-selector";
import { MatchScoreCard } from "@/components/match-score-card";
import type { MatchData } from "@/lib/match-types";

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

export function ExploreTab() {
  const router = useRouter();
  const [season, setSeason] = useState("2025-26");
  const [stage, setStage] = useState<StageFilter>("플레이오프");
  const [gameFilter, setGameFilter] = useState<"all" | "upcoming">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "bracket">("list");

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
              onMatchClick={(m) => router.push(`/matches/${m.id}`)}
            />
          ) : (
            <Section>
              <div className="flex flex-col gap-4 pt-4">
                {filtered.map((match) => (
                  <MatchListCard key={match.id} match={match} onClick={() => router.push(`/matches/${match.id}`)} />
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
