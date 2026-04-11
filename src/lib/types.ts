export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type NationalLevel = "A대표팀" | "국가대표 후보" | "없음";

export interface NationalTeam {
  is_national: boolean;
  years?: string;
  level: NationalLevel;
}

export interface PlayerBio {
  birth_year: number;
  age: number;
  career_year: number;
  national_team: NationalTeam;
}

// 태그 카테고리
export type RoleTag = "에이스" | "1옵션" | "식스맨" | "리더";
export type StyleTag = "수비형" | "슈터" | "플레이메이커" | "리바운더" | "골밑 핵심";
export type ImpactTag = "클러치" | "흐름 체인저" | "안정감" | "폭발력";
export type CareerTag = "국가대표" | "신인왕" | "MVP" | "베테랑";

export type PlayerTag = RoleTag | StyleTag | ImpactTag | CareerTag;

export interface Player {
  id: string;
  name: string;
  position: Position;
  height: string;
  number: number;
  team: string;
  teamId: string;
  imageUrl: string | null;
  bio: PlayerBio;
  tags: PlayerTag[];
}
