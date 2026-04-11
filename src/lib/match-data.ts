import type { MatchData } from "./match-types";

// 선수 프로필 이미지 (하나금융 실제 URL)
const HANA_IMAGES: Record<string, string> = {
  박소희:
    "http://www.hanafnbasketball.com/html/upload/Player/Player_202510100941061481.png",
  정예림:
    "http://www.hanafnbasketball.com/html/upload/Player/Player_202510100947351921.png",
  진안: "http://www.hanafnbasketball.com/html/upload/Player/Player_202510100955464571.png",
  김정은:
    "http://www.hanafnbasketball.com/html/upload/Player/Player_202510100951084211.png",
  이이지마사키:
    "http://www.hanafnbasketball.com/html/upload/Player/Player_202510100952428881.png",
};

const SAMSUNG_IMAGES: Record<string, string> = {
  이해란:
    "http://www.samsungblueminx.com/function/image_stream.jsp?path=player&filename=efdad702-fd74-4c45-ae7f-fde6aa02e85f",
  배혜윤:
    "http://www.samsungblueminx.com/function/image_stream.jsp?path=player&filename=10e880d8-37c8-4ce2-991e-88ac615f6090",
  윤예빈:
    "http://www.samsungblueminx.com/function/image_stream.jsp?path=player&filename=0bc54646-1f38-4a57-8487-70eb3447a825",
  김아름:
    "http://www.samsungblueminx.com/function/image_stream.jsp?path=player&filename=00099332-75fa-4ca9-89d5-725ff7f1b79c",
};


export const MATCH: MatchData = {
  match: {
    date: "2026-04-11",
    time: "16:00",
    location: "부천체육관",
    stage: "플레이오프 1차전",
    home: "하나은행",
    away: "삼성생명",
  },

  teams: [
    {
      name: "하나은행",
      rank: 2,
      summary: "공격 밸런스 좋은 상승세 팀",
    },
    {
      name: "삼성생명",
      rank: 3,
      summary: "수비 중심 조직력 팀",
    },
  ],

  coaches: [
    {
      name: "이상범",
      team: "하나은행",
      career_year: 3,
      style: ["빠른 템포", "공격 밸런스"],
      story: "하위권 팀을 플레이오프 진출팀으로 끌어올린 리빌딩 성공 사례",
      watch_point: "초반 템포 싸움",
      watch_reason: "하나은행은 1쿼터를 잡으면 이긴다. 삼성생명은 1쿼터 실점이 가장 많다.",
      evidence: [],
    },
    {
      name: "하상윤",
      team: "삼성생명",
      career_year: 5,
      style: ["수비 중심", "조직력"],
      story: "수비 조직력을 기반으로 꾸준히 상위권 유지",
      watch_point: "수비 전술 변화",
      watch_reason: "정규시즌 전술이 통하지 않았다. 포스트시즌에서 달라져야 한다.",
      evidence: [],
    },
  ],

  players: [
    // ──── 하나은행 ────────────────────────────────────────
    {
      team: "하나은행",
      name: "김정은",
      featured: true,
      position: "F",
      height: "179cm",
      imageUrl: HANA_IMAGES["김정은"],
      bio: {
        birth_year: 1987,
        age: 39,
        career_year: 20,
        national_team: { is_national: true, level: "A대표팀" },
      },
      stat_summary: "9.3득점 · 6.8리바운드",
      stats: {
        current_season: { points: 9.3, rebounds: 6.8, assists: 2.4 },
        previous_season: { points: 10.1, rebounds: 6.2, assists: 2.1 },
      },
      stat_diff: { points: -0.8, rebounds: 0.6, assists: 0.3 },
      career_highlights: [
        { type: "record", label: "WKBL 통산 득점 1위" },
        { type: "award", label: "MVP 수상" },
      ],
      tags: ["레전드", "국가대표", "클러치"],
      description: "리그를 대표하는 베테랑 포워드",
      watch_point: "출전 시 분위기 변화",
    },
    {
      team: "하나은행",
      name: "진안",
      featured: true,
      position: "C",
      height: "185cm",
      imageUrl: HANA_IMAGES["진안"],
      bio: {
        birth_year: 1996,
        age: 30,
        career_year: 6,
        national_team: { is_national: true, level: "A대표팀" },
      },
      stat_summary: "14.8득점 · 8.0리바운드",
      stats: {
        current_season: { points: 14.8, rebounds: 8.0, assists: 2.0 },
        previous_season: { points: 12.5, rebounds: 7.1, assists: 1.6 },
      },
      stat_diff: { points: 2.3, rebounds: 0.9, assists: 0.4 },
      career_highlights: [{ type: "record", label: "리바운드 팀 1위" }],
      tags: ["국가대표", "골밑 핵심", "리바운더"],
      description: "골밑에서 버티는 핵심 센터",
      watch_point: "파울 관리",
    },
    {
      team: "하나은행",
      name: "이이지마 사키",
      featured: true,
      position: "F",
      height: "178cm",
      imageUrl: HANA_IMAGES["이이지마사키"],
      bio: {
        birth_year: 1998,
        age: 28,
        career_year: 3,
        national_team: { is_national: false },
      },
      stat_summary: "15.0득점 · 6.5리바운드",
      stats: {
        current_season: { points: 15.0, rebounds: 6.5, assists: 3.0 },
        previous_season: { points: 13.2, rebounds: 5.8, assists: 2.5 },
      },
      stat_diff: { points: 1.8, rebounds: 0.7, assists: 0.5 },
      tags: ["에이스", "득점원"],
      description: "팀 공격을 책임지는 1옵션",
      watch_point: "득점 폭발 여부",
    },
    {
      team: "하나은행",
      name: "박소희",
      featured: true,
      position: "G",
      height: "170cm",
      imageUrl: HANA_IMAGES["박소희"],
      bio: {
        birth_year: 1998,
        age: 28,
        career_year: 4,
        national_team: { is_national: false },
      },
      stat_summary: "10.1득점 · 3.5리바운드",
      stats: {
        current_season: { points: 10.1, rebounds: 3.5, assists: 2.8 },
        previous_season: { points: 8.0, rebounds: 3.0, assists: 2.2 },
      },
      stat_diff: { points: 2.1, rebounds: 0.5, assists: 0.6 },
      tags: ["식스맨", "흐름 체인저"],
      description: "경기 흐름을 바꾸는 가드",
      watch_point: "3점슛",
    },
    {
      team: "하나은행",
      name: "정예림",
      featured: false,
      position: "G",
      height: "168cm",
      imageUrl: HANA_IMAGES["정예림"],
      stat_summary: "6.5득점",
      tags: ["슈터"],
    },
    {
      team: "하나은행",
      name: "김지영",
      featured: false,
      position: "G",
      height: "170cm",
      imageUrl: null,
      stat_summary: "5.0득점 · 3.0어시스트",
      tags: ["플레이메이커"],
    },

    // ──── 삼성생명 ────────────────────────────────────────
    {
      team: "삼성생명",
      name: "이해란",
      featured: true,
      position: "F",
      height: "180cm",
      imageUrl: SAMSUNG_IMAGES["이해란"],
      bio: {
        birth_year: 2001,
        age: 25,
        career_year: 4,
        national_team: { is_national: true, level: "A대표팀" },
      },
      stat_summary: "17.5득점 · 7.0리바운드",
      stats: {
        current_season: { points: 17.5, rebounds: 7.0, assists: 3.0 },
        previous_season: { points: 14.0, rebounds: 6.2, assists: 2.5 },
      },
      stat_diff: { points: 3.5, rebounds: 0.8, assists: 0.5 },
      career_highlights: [{ type: "award", label: "신인왕" }],
      tags: ["에이스", "국가대표", "득점원"],
      description: "리그 득점 상위권 에이스",
      watch_point: "득점 흐름",
    },
    {
      team: "삼성생명",
      name: "배혜윤",
      featured: true,
      position: "C",
      height: "183cm",
      imageUrl: SAMSUNG_IMAGES["배혜윤"],
      bio: {
        birth_year: 1989,
        age: 37,
        career_year: 14,
        national_team: { is_national: true, level: "A대표팀" },
      },
      stat_summary: "12.0득점 · 6.5리바운드",
      tags: ["베테랑", "골밑 핵심"],
      description: "경험 많은 베테랑 센터",
      watch_point: "골밑 싸움",
    },
    {
      team: "삼성생명",
      name: "윤예빈",
      featured: true,
      position: "G",
      height: "173cm",
      imageUrl: SAMSUNG_IMAGES["윤예빈"],
      bio: {
        birth_year: 1998,
        age: 28,
        career_year: 6,
      },
      stat_summary: "11.2득점 · 3.5어시스트",
      tags: ["핸들러", "공격 전개"],
      description: "공격을 풀어주는 가드",
      watch_point: "경기 조율",
    },
    {
      team: "삼성생명",
      name: "김아름",
      featured: false,
      position: "G",
      height: "172cm",
      imageUrl: SAMSUNG_IMAGES["김아름"],
      stat_summary: "3점슛 강점",
      tags: ["슈터"],
    },
    {
      team: "삼성생명",
      name: "강유림",
      featured: false,
      position: "F",
      height: "175cm",
      imageUrl: null,
      stat_summary: "수비 역할",
      tags: ["수비형"],
    },
  ],
};

export const TAG_COLORS: Record<string, string> = {
  레전드: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  에이스: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "1옵션": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  식스맨: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  득점원: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  수비형: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  슈터: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  플레이메이커: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  리바운더: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  핸들러: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "공격 전개": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  클러치: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "흐름 체인저": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  안정감: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  폭발력: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
  국가대표: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  신인왕: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  MVP: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  베테랑: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "골밑 핵심": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  윙: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

export const TEAM_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  하나은행: { bg: "#007B5F", text: "white", light: "#e6f4f0" },
  삼성생명: { bg: "#1428A0", text: "white", light: "#e8eaf6" },
};
