"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Section } from "@m1kapp/ui";
import { WKBL_MATCHES, KBL_MATCHES } from "@/lib/matches";
import { TEAMS } from "@/lib/data";
import wkblScoresJson from "../../../data/wkbl/scores.json";
import kblScoresJson from "../../../data/kbl/scores.json";
import { BracketView } from "@/components/bracket-view";
import { DropdownSelector } from "@/components/dropdown-selector";
import { MatchScoreCard } from "@/components/match-score-card";
import { getStageType, type MatchData, type StageFilter } from "@/lib/match-types";

type MatchWithId = MatchData & { id: string };

// ─── 경기 목록 ───────────────────────────────────────────────

function MatchListCard({ match, onClick, accentColor }: { match: MatchWithId; onClick: () => void; accentColor: string }) {
  const { match: m, teams, players, coaches, cancelled, cancelReason } = match;
  // 매치 에디토리얼 데이터 → 없으면 전역 TEAMS에서 폴백
  const home = teams.find((t) => t.name === m.home) ?? TEAMS.find((t) => t.shortName === m.home);
  const away = teams.find((t) => t.name === m.away) ?? TEAMS.find((t) => t.shortName === m.away);
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
              style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: accentColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: accentColor }} />
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


const LEAGUE_COLORS: Record<string, string> = { WKBL: "#007B5F", KBL: "#E31837" };
const THEME_COLOR = "#007B5F";
const SEASONS = ["2025-26", "2024-25", "2023-24", "2022-23"];

type LeagueFilter = "WKBL" | "KBL";

// ─── 정규시즌 경기 카드 ──────────────────────────────────────

type ScoreGame = typeof wkblScoresJson[number];

function RegularSeasonList({ games, league }: { games: ScoreGame[]; league: LeagueFilter }) {
  const TEAM_RANKS = Object.fromEntries(
    TEAMS.filter((t) => t.league === league).map((t) => [t.shortName, t.rank])
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
  const [league, setLeague] = useState<LeagueFilter>("KBL");
  const [season, setSeason] = useState("2025-26");
  const [stage, setStage] = useState<StageFilter>("플레이오프");
  const [gameFilter, setGameFilter] = useState<"all" | "upcoming">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "bracket">("list");

  const accentColor = LEAGUE_COLORS[league] ?? LEAGUE_COLORS.KBL;
  const today = new Date().toISOString().slice(0, 10);

  // 리그별 매치 & 스코어 데이터
  const leagueMatches = league === "KBL" ? KBL_MATCHES : WKBL_MATCHES;
  const leagueScores = league === "KBL" ? kblScoresJson : wkblScoresJson;

  // 정규시즌: scores.json 기반
  const regularGames = (leagueScores as ScoreGame[])
    .filter((g) => {
      if (league === "KBL") return !(g as any).roundCode || (g as any).roundCode === "kbl_r" || (g as any).roundCode === "kbl_ir";
      return g.date < "2026-04";
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // 플레이오프: matches.json 기반
  const filtered = leagueMatches
    .filter((m) => getStageType(m.match.stage) === "플레이오프")
    .filter((m) => gameFilter === "upcoming" ? (m.match.date >= today && !m.cancelled) : true);

  return (
    <>
      {/* 리그·구분 | 시즌 셀렉터 */}
      <div className="px-4 pt-4 pb-0 flex items-stretch gap-2">
        <DropdownSelector
          label="리그"
          value={`${league === "KBL" ? "KBL" : "WKBL"} ${stage}`}
          options={[
            { key: "KBL:플레이오프",   label: "KBL 플레이오프" },
            { key: "KBL:정규시즌",     label: "KBL 정규시즌" },
            { key: "WKBL:플레이오프",  label: "WKBL 플레이오프" },
            { key: "WKBL:정규시즌",    label: "WKBL 정규시즌" },
          ]}
          onSelect={(k) => {
            const [l, s] = k.split(":") as [LeagueFilter, StageFilter];
            setLeague(l);
            setStage(s);
            setViewMode("list");
          }}
          accentColor={THEME_COLOR}
        />
        <DropdownSelector
          label="시즌"
          value={season}
          options={SEASONS.map((s) => ({ key: s, label: s, disabled: s !== "2025-26" }))}
          onSelect={setSeason}
        />
      </div>

      {stage === "정규시즌" ? (
        <RegularSeasonList games={regularGames} league={league} />
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
              matches={leagueMatches.filter((m) => getStageType(m.match.stage) === "플레이오프")}
              league={league}
              onMatchClick={(m) => router.push(`/matches/${m.id}`)}
            />
          ) : (
            <Section>
              <div className="flex flex-col gap-4 pt-4">
                {filtered.map((match) => (
                  <MatchListCard key={match.id} match={match} accentColor={accentColor} onClick={() => router.push(`/matches/${match.id}`)} />
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
