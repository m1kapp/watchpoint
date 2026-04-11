export interface MatchInfo {
  date: string;
  time: string;
  location: string;
  stage: string;
  home: string;
  away: string;
  league?: "WKBL" | "KBL";
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

export interface Coach {
  name: string;
  team: string;
  career_year: number;
  style: string[];
  story: string;
  watch_point: string;
  watch_reason: string;
  evidence: Evidence[];
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

export interface CareerHighlight {
  type: "record" | "award";
  label: string;
}

export interface DraftInfo {
  year: number;   // 드래프트 연도
  round: number;  // 라운드
  pick: number;   // 전체 순번
}

export interface CareerSeason {
  season: string;  // "2024-25"
  team: string;
  games: number;
  points: number;
  rebounds: number;
  assists: number;
  note?: string;   // "신인왕", "MVP" 등 특이사항
}

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
  draft?: DraftInfo;
  career_seasons?: CareerSeason[];
  tags: string[];
  description?: string;
  watch_point?: string;
  watch_reason?: string;
  evidence?: Evidence[];
}

export interface MatchData {
  match: MatchInfo;
  teams: TeamInfo[];
  coaches: Coach[];
  players: MatchPlayer[];
}
