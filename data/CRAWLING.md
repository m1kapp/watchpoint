# 데이터 수집 가이드 (공통)

리그별 상세 가이드는 각 디렉토리 참조:
- `data/kbl/CRAWLING.md` — KBL 남자농구
- `data/wkbl/CRAWLING.md` — WKBL 여자농구

---

## 통합 JSON 포맷 스펙

> WKBL · KBL 양쪽 모두 아래 스키마를 따른다. 리그별 고유 필드는 `(리그별)` 표시.

### players.json

```jsonc
[
  {
    "pno": "096001",              // 선수 고유 ID (WKBL: pno / KBL: playerId)
    "teamId": "bnk",
    "teamName": "BNK 썸",
    "name": "김한별",
    "nameEn": "KIM HANBYEOL",     // nullable — KBL은 공식 소스 없으면 null
    "number": 7,
    "position": "SG",             // C, PF, SF, SG, PG, F, G, GD
    "height": "178cm",            // nullable
    "weight": null,               // nullable
    "birthDate": "1995-03-12",    // YYYY-MM-DD, nullable
    "birthYear": 1995,            // nullable
    "school": "OO고",             // nullable
    "draftYear": 2017,            // nullable
    "draftRound": 1,              // nullable
    "draftPick": 3,               // nullable
    "imageUrl": "https://...",    // nullable — WKBL: wkbl.or.kr, KBL: kbl.or.kr
    "tags": [],                   // generate 스크립트가 채움
    "career_seasons": [           // [0]이 현시즌, 이전 시즌 역순
      {
        "season": "2025-26",
        "team": "BNK 썸",
        "games": 30,
        "points": 12.5,           // PPG
        "rebounds": 3.2,           // RPG
        "assists": 2.1,            // APG
        "spg": 1.0,               // 스틸 (현시즌만)
        "bpg": 0.3,               // 블록 (현시즌만)
        "fgPct": 45.2,            // FG% (현시즌만)
        "threePct": 33.1,         // 3P% (현시즌만)
        "ftPct": 78.5,            // FT% (현시즌만)
        "mpg": 28.3               // 출전시간 (현시즌만)
      }
    ]
  }
]
```

> **KBL 마이그레이션**: `playerId` → `pno`, `stats` 단일 객체 → `career_seasons[0]`, `teamCode` 제거.
> KBL 커리어 데이터는 공식 소스 확보 후 `career_seasons[1..]` 추가.

### teams.json

```jsonc
[
  {
    "teamId": "kb",
    "tcode": "01",               // 리그 공식 코드 (WKBL: tcode / KBL: kblCode)
    "naverCode": null,           // 네이버 스포츠 코드 (KBL 전용, WKBL은 null)
    "teamName": "KB스타즈",
    "nameEn": "KB Stars",        // nullable
    "shortName": "KB스타즈",     // UI 표시용 단축명
    "naverName": "KB스타즈",     // 네이버 스포츠 표기명
    "stadium": "청주체육관",
    "emblemUrl": null             // nullable — KBL만 네이버 엠블럼 URL
  }
]
```

### scores.json

```jsonc
[
  {
    "gameId": "20251116046011",
    "date": "2025-11-16",
    "time": "14:00",
    "home": "KB스타즈",
    "away": "삼성생명",
    "homeScore": 78,
    "awayScore": 65,
    "winner": "home",            // "home" | "away"
    "status": "result",          // "result" | "upcoming" | "live"
    "stadium": "청주체육관",
    "roundCode": null,           // nullable — KBL: "kbl_r", "kbl_ps_6_po" 등
    "roundName": null,           // nullable — KBL: "정규시즌", "6강 PO" 등
    "seriesGameNo": 0,           // 0이면 시리즈 아님
    "seriesOutcome": null        // nullable — { "home": 2, "away": 1 }
  }
]
```

> **WKBL 마이그레이션**: `roundCode`, `roundName`, `seriesGameNo`, `seriesOutcome` 필드 추가 (null/0).

### matches.json

```jsonc
[
  {
    "id": "9693a373",
    "stage": "플레이오프 1차전 (KB·우리)",
    "date": "2026-04-08",
    "time": "18:59",
    "location": "청주체육관",
    "leftTeamId": "kb",
    "rightTeamId": "woori",
    "leftScore": 73,             // nullable
    "rightScore": 46,            // nullable
    "isFinished": true,
    "gameNo": 1,                 // 시리즈 내 경기 번호
    "gameRecordUrl": null,       // nullable — WKBL만 있음
    "photoUrl": null,            // nullable — WKBL만 있음
    "gameId": null,              // nullable — KBL: 네이버 gameId
    "roundCode": null,           // nullable — KBL: "kbl_ps_6_po" 등
    "seriesGameNo": null,        // nullable — KBL 시리즈 번호
    "seriesOutcome": null,       // nullable — { "home": N, "away": N }
    "cancelled": false,          // 취소 여부
    "cancelReason": null,        // nullable
    "teams": [
      { "name": "KB스타즈", "rank": 1, "summary": "정규리그 우승" }
    ],
    "coaches": [],               // Coach[] — 관전 포인트 참조
    "players": []                // MatchPlayer[] — 관전 포인트 참조
  }
]
```

### national-team.json

```jsonc
{
  "_note": "국가대표 로스터",     // optional
  "rosters": [
    {
      "tournament": "2026 FIBA 월드컵 최종예선",
      "date": "2026-03",
      "dateRange": "2026.03.12 ~ 03.18",
      "venue": "대한민국 서울",
      "current": true,
      "result": "예선 통과",
      "players": [
        {
          "number": 7,            // nullable — 등번호
          "name": "김선형",
          "pno": "291785",        // nullable — players.json의 pno
          "position": "PG",
          "height": "183cm",
          "teamId": "sono",       // 통합 필드 (WKBL: wkblTeamId, KBL: kblTeamId → teamId)
          "captain": false,       // optional, default false
          "overseas": null        // nullable — "팀명 (리그명)"
        }
      ]
    }
  ]
}
```

> **마이그레이션**: `wkblTeamId` / `kblTeamId` → `teamId`, `level` 필드 제거, `number` 필드 추가.

### awards.json

```jsonc
{
  "_note": "시즌 개인상 — 이름:pno 형식",
  "_season": "2025-26",
  "mvp": ["박지수:098001"],
  "rookieOfTheYear": ["김도연:903001"]
}
```

> **KBL**: 신규 생성 필요.

### national-tournaments.json

```jsonc
[
  {
    "name": "아시안컵",
    "emoji": "🏆",
    "appearances": 30,
    "record": "163승 45패",
    "medals": "금 12회",
    "note": "최강 전통",
    "color": "#FFD700"
  }
]
```

> **KBL**: 신규 생성 필요.

### rosters.json

```jsonc
[
  { "id": "07034daa", "teamId": "sono", "season": "2025-26" }
]
```

> 양쪽 동일 스키마 — 변경 불필요.

---

## 빠른 상태 점검

```bash
# 전체 데이터 상태 한번에 확인
node -e "
for (const league of ['wkbl','kbl']) {
  console.log('\n=== ' + league.toUpperCase() + ' ===');
  const scores = require('./data/'+league+'/scores.json');
  const players = require('./data/'+league+'/players.json');
  const matches = require('./data/'+league+'/matches.json');
  const today = new Date().toISOString().slice(0,10);
  
  const staleScores = league==='kbl'
    ? scores.filter(g=>g.date<today && g.status==='upcoming').length
    : scores.filter(g=>g.date<today && (!g.homeScore && g.homeScore!==0)).length;
  const staleMatches = matches.filter(g=>g.date<today && g.leftScore==null).length;
  
  console.log('scores:', scores.length+'경기, 미집계:', staleScores+'건');
  console.log('players:', players.length+'명');
  console.log('matches:', matches.length+'경기, 스코어없는 과거:', staleMatches+'건');
}
"
```

---

## 전체 파이프라인

```bash
# WKBL 전체
npm run scrape && npm run generate

# KBL 전체
npm run scrape:kbl

# 양쪽 전체
npm run scrape && npm run generate && npm run scrape:kbl
```

### npm 스크립트 요약

| 스크립트 | 대상 | 설명 |
|----------|------|------|
| `scrape:teams` | WKBL | 팀 메타 (wkbl.or.kr + 네이버) |
| `scrape:players` | WKBL | 선수 로스터 + 현시즌 스탯 |
| `scrape:career` | WKBL | 커리어 스탯 + 수상 이력 |
| `scrape:matches` | WKBL | 플레이오프 일정 (wkbl.or.kr) |
| `scrape:scores` | WKBL | 경기 결과 (네이버 API) |
| `generate` | WKBL | tags 산정 + data.ts 코드젠 |
| `scrape:kbl:teams` | KBL | 팀 메타 (네이버 API) |
| `scrape:kbl:players` | KBL | 선수 스탯 (전경기 박스스코어 집계, ~3분) |
| `scrape:kbl:bio` | KBL | 선수 바이오 보강 — 키/생년/학교/드래프트 (네이버 API, ~1분) |
| `scrape:kbl:matches` | KBL | 플레이오프 일정 (네이버 API) |
| `scrape:kbl:scores` | KBL | 경기 결과 (네이버 API) |

---

## rosters.json — 팀 라우트 ID 매핑

각 리그 디렉토리에 `rosters.json`이 있으며, `/roster/{id}` 라우트용 고유 ID를 부여합니다.
**크롤러가 아닌 수동 생성 파일**입니다.

```json
[
  { "id": "07034daa", "teamId": "sono", "season": "2025-26" },
  { "id": "82e3a0b3", "teamId": "db", "season": "2025-26" }
]
```

**갱신 필요 시점**: 새 시즌 시작 시, 또는 새 팀이 추가될 때.

**생성 방법** (새 시즌이나 새 팀 추가 시):

```bash
node -e "
const crypto = require('crypto');
const teams = require('./data/kbl/teams.json');  // 또는 wkbl
const season = '2026-27';  // 새 시즌
const rosters = teams.map(t => ({
  id: crypto.randomBytes(4).toString('hex'),
  teamId: t.teamId,
  season
}));
console.log(JSON.stringify(rosters, null, 2));
" > data/kbl/rosters.json  # 또는 wkbl
```

> `id`는 랜덤 hex 8자리. URL에 노출되므로 teamId를 직접 쓰지 않고 난수 사용.
> `src/lib/data.ts`에서 양쪽 rosters.json을 통합 로드: `ROSTERS = [...wkblRosters, ...kblRosters]`
> `getRosterId(teamId, season)` / `getRosterById(id)`로 조회.

**점검 명령어**:

```bash
node -e "
for (const league of ['wkbl','kbl']) {
  const rosters = require('./data/'+league+'/rosters.json');
  const teams = require('./data/'+league+'/teams.json');
  const missing = teams.filter(t => !rosters.find(r => r.teamId === t.teamId));
  console.log(league.toUpperCase()+':', rosters.length+'팀 등록');
  if (missing.length) console.log('  누락:', missing.map(t => t.teamId).join(', '));
}
"
```

---

## 앱에서의 데이터 로드 구조

```
data/wkbl/players.json  ──→  scripts/generate/apply-players.ts  ──→  src/lib/data.ts (PLAYERS)
data/kbl/players.json   ──→  src/lib/data.ts (KBL_PLAYERS)  ← 런타임 변환, 코드젠 불필요

data/wkbl/matches.json  ─┐
                          ├──→  src/lib/matches.ts (MATCHES)  ← league: "WKBL" | "KBL" 구분
data/kbl/matches.json   ─┘

data/wkbl/rosters.json  ─┐
                          ├──→  src/lib/data.ts (ROSTERS)  ← /roster/{id} 라우트용
data/kbl/rosters.json   ─┘
```

- WKBL: `scrape → generate` 파이프라인으로 `data.ts`에 코드젠
- KBL: `data.ts`에서 JSON 직접 import → `Player` 타입 런타임 변환
- 매치: 양쪽 JSON을 `matches.ts`에서 통합 로드, `league` 필드로 구분

---

## 관전 포인트 작성 (matches.json)

다음 경기 `matches.json`에 `coaches[]` / `players[]` 관전 포인트를 채울 때.

**프롬프트 템플릿** (리그명과 팀명만 바꿔서 사용):

```
[팀A] vs [팀B] 플레이오프 [N]차전 관전 포인트 작성해줘.

1. 웹서치로 최신 기사 찾기:
   - 검색어: "[팀A] [팀B] 플레이오프 프리뷰" 또는 "[경기일] [KBL/WKBL] 농구"
   - 소스 우선순위: basketkorea.com > 네이버스포츠 > 스포츠조선/한국경제 스포츠
   - 찾을 내용: 양 팀 전력 분석, 주목 선수, 감독 전술 코멘트, 직전 경기 흐름

2. data/[kbl 또는 wkbl]/matches.json에서 해당 경기 ID 찾아서
   coaches[] 와 players[].featured=true 항목에 아래 필드 채워줘:
   
   coaches 항목:
   - watch_point: 감독 전술 핵심 한 줄 (8자 이내 명사형)
   - watch_reason: 왜 이게 포인트인지 (기사 근거 포함, 2~3문장)
   - evidence: [ { label, value, highlight } ] 3개 — 수치/통계/전적 근거
   - sources: [ { label, url } ] — 기사 출처 + 데이터 출처 (아래 참조)

   players[].featured=true 항목:
   - watch_point: 선수 관전 포인트 한 줄 (8자 이내 명사형)
   - watch_reason: 왜 이 선수가 핵심인지 (기사 근거 포함)
   - evidence: [ { label, value, highlight } ] 3개
   - sources: [ { label, url } ] — 기사 출처 + 데이터 출처

3. 기사에서 수치를 못 찾으면 해당 리그 players.json의 현시즌 스탯 참조.

4. 선수 imageUrl:
   - WKBL: wkbl.or.kr 기준 URL 그대로 복사 (players.json의 imageUrl)
   - KBL: kbl.or.kr/files/kbl/players-photo/{playerId}.png

5. 감독 이름 반드시 웹서치로 검증 — 기억에 의존 금지.
   검색어: "[팀명] 감독 2026 KBL" 또는 "[팀명] 감독 2026 WKBL"

참고:
- evidence highlight:true는 가장 임팩트 있는 수치 1개에만.
- evidence value에 영어 약어(ppg, rpg 등) 사용 금지. 한글로: "18.8점", "12.5리바", "6.7어시", "1.9스틸"
- sources 필수. 기사 URL이 있으면 { label: "매체명", url: "..." }, 시즌 데이터 기반이면 { label: "시즌 데이터", url: null }

**총 관전 포인트는 최대 7개** (coaches + players[].featured 합산).
감독 2명 + 선수 5명이 상한선. 핵심만 추려서 넣을 것.
```

**점검 명령어** (관전 포인트가 없는 경기 확인):

```bash
node -e "
const today=new Date().toISOString().slice(0,10);
for (const league of ['wkbl','kbl']) {
  const d=require('./data/'+league+'/matches.json');
  const missing=d.filter(g=>!g.cancelled && g.date>=today && (!g.coaches?.length && !g.players?.some(p=>p.featured)));
  if (missing.length) {
    console.log(league.toUpperCase()+' 관전포인트 없는 예정 경기:');
    missing.forEach(g=>console.log(' ', g.date, g.stage, '->', g.id));
  }
}
"
```

> 취소된 경기(`cancelled: true`)는 관전 포인트 불필요.
> 직전 차전 결과 반영 필수 — 예: "2차전 이후 3차전" 프리뷰라면 이전 경기 점수도 watch_reason에 언급.

---

## 관전 포인트 리뷰 작성 (경기 후)

경기가 끝난 후 각 관전 포인트가 실제로 어떻게 됐는지 `review` 필드를 채울 때.

**프롬프트 템플릿**:

```
[팀A] vs [팀B] [N]차전 경기 결과 기반으로 관전 포인트 리뷰 작성해줘.

1. 웹서치로 경기 결과 기사 찾기:
   - 검색어: "[팀A] [팀B] [N]차전 결과" 또는 "[경기일] [KBL/WKBL] 결과"
   - 소스: basketkorea.com, 네이버스포츠, 스포츠조선

2. data/[kbl 또는 wkbl]/matches.json에서 해당 경기 ID 찾아서
   coaches[]와 players[].featured=true 항목 각각에 review 필드 추가:

   "review": {
     "result": "적중" | "부분적중" | "빗나감",
     "summary": "실제로 어떻게 됐는지 1~2문장. 수치 포함 권장."
   }

3. 판정 기준:
   - 적중: 관전 포인트 예측이 경기 결과에 직접 영향을 미침
   - 부분적중: 현상은 맞았지만 결과에 영향이 제한적이거나 반쪽만 맞음
   - 빗나감: 예측과 반대로 전개되거나 해당 포인트가 경기와 무관했음
```

**점검 명령어** (리뷰 없는 종료 경기 확인):

```bash
node -e "
for (const league of ['wkbl','kbl']) {
  const d=require('./data/'+league+'/matches.json');
  const finished=d.filter(g=>g.leftScore!=null && !g.cancelled);
  finished.forEach(g=>{
    const missing=[
      ...(g.coaches||[]).filter(c=>!c.review).map(c=>c.name+'(감독)'),
      ...(g.players||[]).filter(p=>p.featured&&p.watch_point&&!p.review).map(p=>p.name),
    ];
    if(missing.length) console.log(league.toUpperCase(), g.date, g.stage, '-> 리뷰 없음:', missing.join(', '));
  });
}
"
```

---

## 웹서치 갱신 — 국가대표 명단

> **왜 웹서치인가?** 농구협회(`koreabasketball.or.kr`)는 일정만 노출하고 로스터 데이터는 HTML에 없음.
> FIBA 사이트도 SPA라 API 비공개. 크롤링 가능한 구조화된 국대 명단 소스가 현재 없어서
> basketkorea.com 등 기사 본문에서 웹서치로 수집하는 수밖에 없음.

### KBL 남자대표 (`data/kbl/national-team.json`)

```
남자농구 국가대표 최신 명단 웹서치해서 data/kbl/national-team.json roster 갱신해줘.
필드: name, pno(players.json에서 playerId 확인), level(A대표팀), kblTeamId
해외 소속 선수는 pno: null, kblTeamId: null, overseas: "팀명 (리그명)"
overseas 예시: "나가사키 벨카 (일본 B리그)", "시애틀대학교 (미국 NCAA D1)", "국군체육부대 (상무)"
```

### WKBL 여자대표 (`data/wkbl/national-team.json`)

```
여자농구 국가대표 최신 명단 웹서치해서 data/wkbl/national-team.json roster 갱신해줘.
필드: name, pno(players.json에서 확인), level(A대표팀/국가대표 후보), wkblTeamId, captain
해외 소속 선수는 pno: null, wkblTeamId: null, overseas: "팀명 (리그명)"
overseas 예시: "아줄 마리노 (스페인 리가 페메니나 2부)"
```

> 소스: FIBA 월드컵예선/아시아컵 최종 엔트리 기사 (basketkorea.com, 대한민국농구협회)

**점검 명령어**:

```bash
node -e "
for (const [league, path] of [['KBL','./data/kbl/national-team.json'],['WKBL','./data/wkbl/national-team.json']]) {
  const d=require(path);
  console.log(league+':');
  d.rosters.forEach(r => {
    const overseas=r.players.filter(p=>p.overseas).map(p=>p.name+' ('+p.overseas+')');
    console.log(' ', r.current?'[현재]':'      ', r.tournament, '-', r.players.length+'명', r.result??'');
    if(overseas.length) console.log('    해외:', overseas.join(', '));
  });
}
"
```

---

## 공통 이미지 URL 패턴

| 리그 | 대상 | URL 패턴 |
|------|------|----------|
| WKBL | 팀 로고 | `wkbl.or.kr/static/images/team/teamlogo_{tcode}.png` |
| WKBL | 선수 사진 | `wkbl.or.kr/static/images/player/pimg/np_{pno}.png` |
| KBL | 팀 로고 (SVG) | `kbl.or.kr/assets/img/ico/logo/ic-{kblCode}.svg` |
| KBL | 선수 사진 | `kbl.or.kr/files/kbl/players-photo/{playerId}.png` |
| KBL | 팀 엠블럼 (PNG) | `kbl.or.kr/assets/img/club/{kblCode}/emblem-{kblCode}01.png` |

---

## 시즌 전환 체크리스트

시즌이 바뀔 때 업데이트해야 할 항목:

1. **WKBL**: `scripts/scrape/wkbl/constants.ts`
   - `CURRENT_SEASON_GU` 올림 (e.g. `"046"` → `"047"`)
   - `SEASON_GU_MAP`에 신규 시즌 추가
   - `WKBL_URLS.playoff()` URL 수정

2. **KBL**: `scripts/scrape/kbl/constants.ts`
   - `CURRENT_SEASON`, `SEASON_FROM`, `SEASON_TO` 수정

3. **공통**: `src/lib/data.ts`
   - `TEAMS` 배열의 `rank`, `summary` 갱신 (아래 점검 명령어로 실제 순위 확인 후 반영)

**TEAMS 순위 점검 명령어** (scores.json 기반 실제 순위 확인):

```bash
node -e "
for (const league of ['wkbl','kbl']) {
  const scores = require('./data/'+league+'/scores.json');
  const roundFilter = league === 'kbl' ? 'kbl_r' : null;
  const regular = scores.filter(g => g.status === 'result' && (!roundFilter || g.roundCode === roundFilter));
  const rec = {};
  for (const g of regular) {
    rec[g.home] = rec[g.home] ?? {w:0,l:0};
    rec[g.away] = rec[g.away] ?? {w:0,l:0};
    if (g.winner === 'home') { rec[g.home].w++; rec[g.away].l++; }
    else { rec[g.away].w++; rec[g.home].l++; }
  }
  const sorted = Object.entries(rec).map(([t,{w,l}]) => ({t,w,l})).sort((a,b) => b.w/(b.w+b.l) - a.w/(a.w+a.l));
  console.log('\n=== ' + league.toUpperCase() + ' 정규시즌 순위 ===');
  sorted.forEach((r,i) => console.log((i+1)+'. '+r.t+' '+r.w+'승 '+r.l+'패'));
}
"
```

> `data.ts`의 `TEAMS.rank`가 이 결과와 다르면 수정 필요. 순위는 크롤링 자동화가 아니라 수동 관리이므로, 시즌 종료 후 반드시 점검할 것.
   - KBL_PLAYERS 변환의 `season: "2025-26"` 업데이트

4. **국가대표**: 양쪽 `national-team.json`의 `current: true` 대회 갱신
