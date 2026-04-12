# 데이터 수집 가이드 (Claude Code용)

## 갱신 필요 여부 판단 기준

각 파일을 빠르게 점검해서 갱신 필요 여부를 판단하는 방법입니다.

### scores.json — 경기 결과

```bash
node -e "
const d=require('./data/wkbl/scores.json');
const today=new Date().toISOString().slice(0,10);
const stale=d.filter(g=>g.date<today && (!g.homeScore && g.homeScore!==0));
const live=d.filter(g=>g.status==='live');
console.log('미집계(과거):', stale.length, '건 | live:', live.length, '건');
console.log('마지막 결과:', d.filter(g=>g.homeScore!=null).at(-1)?.date);
"
```

**갱신 필요**: `미집계(과거)` 건수 > 0 이거나 `live` 경기가 있을 때
→ `npm run scrape:scores`

---

### players.json — 선수 로스터 / 시즌 스탯 / 커리어

```bash
node -e "
const d=require('./data/wkbl/players.json');
const withCurrent=d.filter(p=>p.career_seasons?.length>0);
const withCareer=d.filter(p=>p.career_seasons?.length>1);
const withHighlights=d.filter(p=>p.career_highlights?.length>0);
console.log('총', d.length, '명');
console.log('현 시즌 스탯 있음:', withCurrent.length, '명');
console.log('커리어 2시즌 이상:', withCareer.length, '명');
console.log('수상 이력 있음:', withHighlights.length, '명');
console.log('샘플:', d.find(p=>p.career_seasons?.length>1)?.name, d.find(p=>p.career_seasons?.length>1)?.career_seasons?.length, '시즌');
"
```

**갱신 필요**:
- 시즌 초 / 트레이드 후 선수 명단이 바뀌었을 때
- `현 시즌 스탯 있음` 수가 현저히 적을 때
- `career_seasons` 없음 목록에 실제 WKBL 경력이 있는 선수가 포함되었을 때

→ `npm run scrape:players && npm run scrape:career && npm run generate`

> `career_seasons[0]`이 현재 시즌 스탯 (PPG/RPG/APG + spg/bpg/fgPct/threePct/ftPct/mpg 포함).
> 이전 시즌은 기본 스탯(득점/리바/어시)만 있음.
> `seasonStats` 필드는 더 이상 존재하지 않음.

---

### matches.json — 플레이오프 일정

```bash
node -e "
const d=require('./data/wkbl/matches.json');
const today=new Date().toISOString().slice(0,10);
const noScore=d.filter(g=>g.date<today && g.leftScore==null);
console.log('스코어 없는 과거 경기:', noScore.map(g=>g.date+' '+g.leftTeamId+'vs'+g.rightTeamId));
"
```

**갱신 필요**: 과거 경기인데 스코어가 null인 항목이 있을 때
→ `npm run scrape:matches`

> 정규화된 구조: `leftTeamId`/`rightTeamId` (teams.json 참조), `leftWin`/`rightWin`/`location` 없음.
> 중립 구장일 때만 `neutralVenue` 필드 추가.

---

### awards.json — MVP · 신인왕

```bash
node -e "const d=require('./data/wkbl/awards.json'); console.log('시즌:', d._season, '| MVP:', d.mvp, '| 신인왕:', d.rookieOfTheYear);"
```

**갱신 필요**: `_season`이 현재 시즌(`constants.ts`의 CURRENT_SEASON_GU 기준)과 다를 때, 또는 정규시즌이 막 끝났을 때
→ 웹서치로 갱신 (아래 참조)

---

### national-team.json — 국가대표 명단

```bash
node -e "
const d=require('./data/wkbl/national-team.json');
const cur=d.rosters.find(r=>r.current);
console.log('현재 명단:', cur?.tournament, cur?.players?.length, '명');
"
```

**갱신 필요**: FIBA 대회(아시아컵·월드컵예선) 최종 엔트리 발표 후
→ 웹서치로 갱신 (아래 참조)

---

## 현재 데이터 상태 (2026-04-12 기준)

| 파일 | 상태 | 비고 |
|------|------|------|
| `scores.json` | ⚠️ 갱신 필요 | 오늘(04-12) 경기 live, 내일 이후 미정 6경기 |
| `players.json` | ✅ 최신 | 101명, career_seasons[0]에 현시즌 상세 스탯 포함 |
| `matches.json` | ✅ 최신 | 플레이오프 10경기, 정규화 완료 (leftTeamId/rightTeamId) |
| `awards.json` | ✅ 최신 | 2025-26 MVP 박지수, 신인왕 김도연 |
| `national-team.json` | ✅ 최신 | 2026 월드컵 최종예선 명단 12명, 결과 반영 완료 |

---

## 전체 파이프라인

```
scrape:teams     → teams.json
scrape:scores    → scores.json
scrape:matches   → matches.json
scrape:players   ┐
scrape:career    ┤ → players.json (로스터 + career_seasons + career_highlights)
utils:tags       ┘
generate:players → src/lib/data.ts  ← 앱이 실제로 읽는 파일
```

> `scrape:players` 후 반드시 `scrape:career` → `generate` 실행해야 `data.ts`에 반영됨.
> `scrape:career`는 `ajax_detail_sumUp.asp`(커리어 스탯)와 `ajax_detail_prize.asp`(수상)를 각 1회씩 호출.

### 자주 쓰는 조합

```bash
# 경기 결과만 빠르게
npm run scrape:scores

# 선수 데이터 전체 갱신
npm run scrape:players && npm run scrape:career && npm run generate

# 전체
npm run scrape && npm run generate
```

---

## 스크립트 위치 및 소스

| 스크립트 | 파일 | 소스 |
|----------|------|------|
| `scrape:teams`     | `scripts/scrape/wkbl/teams.ts`          | `wkbl.or.kr` 팀 목록 + 팀 상세 + 네이버 API |
| `scrape:scores`    | `scripts/scrape/wkbl/scores.ts`         | 네이버 스포츠 API `api-gw.sports.naver.com` |
| `scrape:matches`   | `scripts/scrape/wkbl/matches.ts`        | `wkbl.or.kr/event/playoff2526/` |
| `scrape:players`   | `scripts/scrape/wkbl/players.ts`        | `wkbl.or.kr/player/detail.asp` |
| `scrape:career`    | `scripts/scrape/wkbl/career-seasons.ts` | `ajax_detail_sumUp.asp` (전시즌 스탯) + `ajax_detail_prize.asp` (수상) |
| `generate:players` | `scripts/generate/apply-players.ts`     | `players.json` → `src/lib/data.ts` 교체 |
| `utils:tags`       | `scripts/utils/assign-tags.ts`          | `career_seasons[0]` 기반 태그 자동 산정 |

공통 상수: `scripts/scrape/wkbl/constants.ts`

> **EUC-KR 처리**: WKBL API 응답을 `Buffer` 그대로 cheerio에 전달해야 한글이 정상 디코딩됨.
> (`TextDecoder('euc-kr')`는 일부 문자 오매핑 발생)

> **라운드 MVP 필터**: `ajax_detail_prize.asp`에서 "N라운드 MVP", "Round N" 형태는 자동 제외.
> 시즌 MVP, 챔피언전 MVP, BEST 5, 수비상, 기록상 등만 포함.

---

## 관전 포인트 작성 (matches.json watchpoints)

다음 경기 `matches.json`에 `coaches[]` / `players[]` 관전 포인트를 채울 때.

**프롬프트 템플릿** (경기 ID와 팀명만 바꿔서 사용):

```
[팀A] vs [팀B] 플레이오프 [N]차전 관전 포인트 작성해줘.

1. 웹서치로 최신 기사 찾기:
   - 검색어: "[팀A] [팀B] 플레이오프 프리뷰" 또는 "[경기일] 여자농구"
   - 소스 우선순위: basketkorea.com > 네이버스포츠 > 스포츠조선/한국경제 스포츠
   - 찾을 내용: 양 팀 전력 분석, 주목 선수, 감독 전술 코멘트, 직전 경기 흐름

2. data/wkbl/matches.json에서 해당 경기 ID(예: po-hs-g3) 찾아서
   coaches[] 와 players[].featured=true 항목에 아래 필드 채워줘:
   
   coaches 항목:
   - watch_point: 감독 전술 핵심 한 줄 (8자 이내 명사형)
   - watch_reason: 왜 이게 포인트인지 (기사 근거 포함, 2~3문장)
   - evidence: [ { label, value, highlight } ] 3개 — 수치/통계/전적 근거

   players[].featured=true 항목:
   - watch_point: 선수 관전 포인트 한 줄 (8자 이내 명사형)  
   - watch_reason: 왜 이 선수가 핵심인지 (기사 근거 포함)
   - evidence: [ { label, value, highlight } ] 3개

3. 기사에서 수치를 못 찾으면 players.json 현시즌 스탯(career_seasons[0]) 참조.
   players.json에서 pno로 매칭하거나 이름+팀으로 찾기.

4. 선수 imageUrl은 반드시 players.json의 imageUrl (wkbl.or.kr 기준) 그대로 복사.
   팀 공식 사이트(hanafnbasketball.com, samsungblueminx.com 등) URL 사용 금지 — 깨짐.

참고: evidence highlight:true는 가장 임팩트 있는 수치 1개에만.

**⚠️ 총 관전 포인트는 최대 7개** (coaches + players[].featured 합산).
감독 2명 + 선수 5명이 상한선. 핵심만 추려서 넣을 것.
```

**점검 명령어** (관전 포인트가 없는 경기 확인):

```bash
node -e "
const d=require('./data/wkbl/matches.json');
const today=new Date().toISOString().slice(0,10);
const missing=d.filter(g=>!g.cancelled && g.date>=today && (!g.coaches?.length && !g.players?.some(p=>p.featured)));
console.log('관전 포인트 없는 예정 경기:');
missing.forEach(g=>console.log(' ', g.date, g.stage, '→', g.id));
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
   - 검색어: "[팀A] [팀B] [N]차전 결과" 또는 "[경기일] 여자농구 결과"
   - 소스: basketkorea.com, 네이버스포츠, 스포츠조선
   - 찾을 내용: 최종 스코어, 주요 선수 활약, 경기 흐름, 감독 코멘트

2. data/wkbl/matches.json에서 해당 경기 ID 찾아서
   coaches[]와 players[].featured=true 항목 각각에 review 필드 추가:

   "review": {
     "result": "적중" | "부분적중" | "빗나감",
     "summary": "실제로 어떻게 됐는지 1~2문장. 수치 포함 권장."
   }

3. 판정 기준:
   - 적중: 관전 포인트 예측이 경기 결과에 직접 영향을 미침
   - 부분적중: 현상은 맞았지만 결과(승패)에 영향이 제한적이었거나 반쪽만 맞음
   - 빗나감: 예측과 반대로 전개되거나 해당 포인트가 경기와 무관했음
```

**점검 명령어** (리뷰 없는 종료 경기 확인):

```bash
node -e "
const d=require('./data/wkbl/matches.json');
const finished=d.filter(g=>g.leftScore!=null && !g.cancelled);
finished.forEach(g=>{
  const missing=[
    ...(g.coaches||[]).filter(c=>!c.review).map(c=>c.name+'(감독)'),
    ...(g.players||[]).filter(p=>p.featured&&p.watch_point&&!p.review).map(p=>p.name),
  ];
  if(missing.length) console.log(g.date, g.stage, '→ 리뷰 없음:', missing.join(', '));
});
"
```

---

## 웹서치로 갱신해야 하는 데이터

### 국가대표 명단 (`national-team.json`)
```
여자농구 국가대표 최신 명단 웹서치해서
data/wkbl/national-team.json roster 갱신해줘.
필드: name, pno(players.json에서 확인), level(A대표팀/국가대표 후보), wkblTeamId, captain
해외 소속 선수는 pno: null, wkblTeamId: null
```
> 소스: FIBA 아시아컵·월드컵예선 최종 엔트리 기사 (basketkorea.com, 대한민국농구협회)

### MVP · 신인왕 (`awards.json`)
```
이번 시즌 WKBL 정규시즌 MVP/신인왕 웹서치해서
data/wkbl/awards.json 갱신해줘.
key 형식: "이름:pno" (_season 필드도 해당 시즌으로 업데이트)
```

### 국제대회 이력 (`national-tournaments.json`)
```
한국 여자농구 국가대표 최근 국제대회 성적 웹서치해서
data/wkbl/national-tournaments.json 갱신해줘.
```

---

## 시즌 전환 시

`scripts/scrape/wkbl/constants.ts` 수정:

```ts
export const CURRENT_SEASON_GU = "047";  // 046 → 047

export const SEASON_GU_MAP: Record<string, string> = {
  "047": "2026-27",  // 신규 추가
  "046": "2025-26",
  // ...
};
```

`WKBL_URLS.playoff()` URL도 함께 수정:
```ts
playoff: () => `${WKBL_BASE}/event/playoff2627/`,
```
