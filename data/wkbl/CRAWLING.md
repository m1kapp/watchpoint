# WKBL 데이터 수집 가이드

> 공통 가이드 (관전 포인트 작성/리뷰, 국대 갱신, 시즌 전환 등): `data/CRAWLING.md`

## 갱신 필요 여부 판단

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

**갱신**: `npm run scrape:scores`

---

### players.json — 선수 로스터 / 시즌 스탯 / 커리어

```bash
node -e "
const d=require('./data/wkbl/players.json');
const withCurrent=d.filter(p=>p.career_seasons?.length>0);
const withCareer=d.filter(p=>p.career_seasons?.length>1);
console.log('총', d.length, '명');
console.log('현 시즌 스탯:', withCurrent.length, '명 | 커리어 2시즌+:', withCareer.length, '명');
"
```

**갱신**: `npm run scrape:players && npm run scrape:career && npm run generate`

> `career_seasons[0]`이 현재 시즌 스탯 (PPG/RPG/APG + spg/bpg/fgPct/threePct/ftPct/mpg 포함).
> 이전 시즌은 기본 스탯(득점/리바/어시)만 있음.

---

### matches.json — 플레이오프 일정

```bash
node -e "
const d=require('./data/wkbl/matches.json');
const today=new Date().toISOString().slice(0,10);
const noScore=d.filter(g=>g.date<today && g.leftScore==null);
console.log('전체:', d.length, '경기 | 스코어 없는 과거:', noScore.length);
"
```

**갱신**: `npm run scrape:matches`

> 정규화된 구조: `leftTeamId`/`rightTeamId` (teams.json 참조).
> 중립 구장일 때만 `neutralVenue` 필드 추가.

---

### awards.json — MVP / 신인왕

```bash
node -e "const d=require('./data/wkbl/awards.json'); console.log('시즌:', d._season, '| MVP:', d.mvp, '| 신인왕:', d.rookieOfTheYear);"
```

**갱신**: 정규시즌 종료 직후 웹서치로 갱신

```
이번 시즌 WKBL 정규시즌 MVP/신인왕 웹서치해서
data/wkbl/awards.json 갱신해줘.
key 형식: "이름:pno" (_season 필드도 해당 시즌으로 업데이트)
```

---

## 스크립트 및 소스

| 스크립트 | 소스 |
|----------|------|
| `scrape:teams` | `wkbl.or.kr` 팀 목록 + 상세 + 네이버 API |
| `scrape:players` | `wkbl.or.kr/player/detail.asp` (EUC-KR) |
| `scrape:career` | `ajax_detail_sumUp.asp` (커리어) + `ajax_detail_prize.asp` (수상) |
| `scrape:matches` | `wkbl.or.kr/event/playoff2526/` |
| `scrape:scores` | 네이버 스포츠 API |
| `generate` | tags 산정 → data.ts 코드젠 |

공통 상수: `scripts/scrape/wkbl/constants.ts`

> **EUC-KR 처리**: WKBL API 응답을 `Buffer` 그대로 cheerio에 전달해야 한글이 정상 디코딩됨.
> **라운드 MVP 필터**: `ajax_detail_prize.asp`에서 "N라운드 MVP" 형태는 자동 제외. 시즌 MVP, BEST 5 등만 포함.

## 팀코드 매핑

| teamId | tcode | 팀명 | 홈구장 |
|--------|-------|------|--------|
| kb | 01 | KB스타즈 | 청주체육관 |
| samsung | 03 | 삼성생명 블루밍스 | 용인실내체육관 |
| woori | 05 | 우리은행 우리WON | 아산이순신체육관 |
| shinhan | 07 | 신한은행 에스버드 | 인천도원체육관 |
| hana | 09 | 하나은행 | 부천체육관 |
| bnk | 11 | BNK 썸 | 부산사직실내체육관 |

## 경기 타입 코드

| game_type | 의미 |
|-----------|------|
| `01` | 정규시즌 |
| `02` | 준플레이오프 |
| `03` | 플레이오프 |
| `04` | 챔피언결정전 |

## 데이터 소스

| 데이터 | URL 패턴 |
|--------|----------|
| 경기 결과 | `api-gw.sports.naver.com/schedule/games?categoryId=wkbl` |
| 팀 로고 | `wkbl.or.kr/static/images/team/teamlogo_{tcode}.png` |
| 선수 사진 | `wkbl.or.kr/static/images/player/pimg/np_{pno}.png` |
| 선수 상세 | `wkbl.or.kr/player/detail.asp?pno={pno}` |
| 시즌 스탯 | `wkbl.or.kr/player/ajax/ajax_detail_season.asp` (POST) |
| 커리어 스탯 | `wkbl.or.kr/player/ajax/ajax_detail_sumUp.asp` (POST) |
| 수상 이력 | `wkbl.or.kr/player/ajax/ajax_detail_prize.asp` (POST) |

## 현재 상태 (2026-04-13)

| 파일 | 비고 |
|------|------|
| `scores.json` | 전 시즌 경기 결과 |
| `players.json` | 101명, career_seasons + career_highlights 포함 |
| `matches.json` | 플레이오프 10경기 |
| `awards.json` | 2025-26 MVP 박지수, 신인왕 김도연 |
| `national-team.json` | 월드컵 최종예선 12명 + 아시아컵 12명 |
