export interface MatchScore {
  home: number;
  away: number;
}

export interface MatchInfo {
  date: string;
  time: string;
  location: string;
  stage: string;
  home: string;
  away: string;
  league?: "WKBL" | "KBL";
  score?: MatchScore;
}

export interface TeamInfo {
  name: string;
  rank: number;
  summary: string;
}

export interface Evidence {
  label: string;   // "vs 삼성 상대 전적"
  value: string;   // "0승 2패"
  highlight?: boolean; // 강조 여부
}

export type ReviewResult = "적중" | "부분적중" | "빗나감";

export interface WatchReview {
  result: ReviewResult;
  summary: string;
}

export interface Source {
  label: string;
  url?: string;
}

export interface Coach {
  name: string;
  team: string;
  career_year: number;
  style: string[];
  story: string;
  watch_point: string;
  watch_reason: string;
  evidence: Evidence[];
  sources?: Source[];
  review?: WatchReview;
}

export interface StatLine {
  points: number;
  rebounds: number;
  assists: number;
}

export interface StatDiff {
  points: number;
  rebounds: number;
  assists: number;
}

import type { CareerHighlight, DraftInfo, CareerSeason, NationalTeam } from "@/lib/types";
export type { CareerHighlight, DraftInfo, CareerSeason };

/** 매치 에디토리얼 데이터의 bio — roster PlayerBio와 달리 모든 필드가 optional */
export interface MatchPlayerBio {
  birth_year?: number;
  age?: number;
  career_year?: number;
  national_team?: Partial<NationalTeam>;
}

export interface MatchPlayer {
  id?: string;            // 선수 ID (예: "samsung-096028") — roster 매칭용
  team: string;
  name: string;
  featured: boolean;
  position: string;
  height: string;
  imageUrl?: string | null;
  bio?: MatchPlayerBio;
  stat_summary: string;
  stats?: {
    current_season: StatLine;
    previous_season: StatLine;
  };
  stat_diff?: StatDiff;
  career_highlights?: CareerHighlight[];
  tags: string[];
  description?: string;
  watch_point?: string;
  watch_reason?: string;
  evidence?: Evidence[];
  sources?: Source[];
  review?: WatchReview;
}

export interface MatchData {
  match: MatchInfo;
  teams: TeamInfo[];
  coaches: Coach[];
  players: MatchPlayer[];
  cancelled?: boolean;       // 시리즈 조기 종료로 취소된 경기
  cancelReason?: string;     // 취소 사유 (예: "KB 3-0 시리즈 클로즈")
}

// ─── 스테이지 분류 상수 ─────────────────────────────────────────

export const STAGE_KEYWORDS = {
  PLAYOFF: ["플레이오프", "준플레이오프"],
  CHAMPIONSHIP: ["챔피언"],
} as const;

export type StageFilter = "플레이오프" | "정규시즌";

/** stage 문자열을 StageFilter로 분류 */
export function getStageType(stage: string): StageFilter {
  const { PLAYOFF, CHAMPIONSHIP } = STAGE_KEYWORDS;
  if ([...PLAYOFF, ...CHAMPIONSHIP].some((k) => stage.includes(k))) {
    return "플레이오프";
  }
  return "정규시즌";
}
