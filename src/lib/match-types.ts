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

export interface Coach {
  name: string;
  team: string;
  career_year: number;
  style: string[];
  story: string;
  watch_point: string;
  watch_reason: string;
  evidence: Evidence[];
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

import type { CareerHighlight, DraftInfo, CareerSeason } from "@/lib/types";
export type { CareerHighlight, DraftInfo, CareerSeason };

export interface NationalTeamInfo {
  is_national: boolean;
  level?: string;
}

export interface PlayerBio {
  birth_year: number;
  age: number;
  career_year: number;
  national_team?: NationalTeamInfo;
}

export interface MatchPlayer {
  team: string;
  name: string;
  featured: boolean;
  position: string;
  height: string;
  imageUrl?: string | null;
  bio?: PlayerBio;
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
