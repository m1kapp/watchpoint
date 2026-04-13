# KBL 데이터 수집 가이드

> 공통 가이드 (관전 포인트 작성/리뷰, 국대 갱신, 시즌 전환 등): `data/CRAWLING.md`

## 갱신 필요 여부 판단

### scores.json — 경기 결과

```bash
node -e "
const d=require('./data/kbl/scores.json');
const today=new Date().toISOString().slice(0,10);
const stale=d.filter(g=>g.date<today && g.status==='upcoming');
const live=d.filter(g=>g.status==='live');
console.log('미집계(과거):', stale.length, '건 | live:', live.length, '건');
console.log('마지막 결과:', d.filter(g=>g.status==='result').at(-1)?.date);
"
```

**갱신**: `npm run scrape:kbl:scores`

---

### players.json — 선수 로스터 / 시즌 스탯 / 바이오

```bash
node -e "
const d=require('./data/kbl/players.json');
const cs=d.filter(p=>p.career_seasons?.length>0);
const bio=d.filter(p=>p.height!=null);
const top=cs.sort((a,b)=>(b.career_seasons[0]?.points??0)-(a.career_seasons[0]?.points??0));
console.log('총', d.length, '명');
console.log('현 시즌 스탯:', cs.length, '명 | 바이오:', bio.length, '명');
console.log('상위:', top.slice(0,5).map(p=>p.name+' '+p.career_seasons[0].points+'ppg').join(', '));
"
```

**갱신 (스탯)**: `npm run scrape:kbl:players` (~3분, 전경기 박스스코어 집계)
**갱신 (바이오)**: `npm run scrape:kbl:bio` (~1분, 네이버 선수 API)

> 스탯: 네이버 게임 기록 API에서 정규시즌+PO 전경기 집계. 출전 기록 있는 선수만 포함.
> 바이오: 네이버 스포츠 선수 API에서 height, birthDate, school, draft 보강.
> `career_seasons[0]`이 현재 시즌 스탯 (PPG/RPG/APG + spg/bpg/fgPct/threePct/ftPct/mpg 포함).

---

### matches.json — 플레이오프 일정

```bash
node -e "
const d=require('./data/kbl/matches.json');
const today=new Date().toISOString().slice(0,10);
const noScore=d.filter(g=>g.date<today && g.leftScore==null);
console.log('전체:', d.length, '경기 | 스코어 없는 과거:', noScore.length);
"
```

**갱신**: `npm run scrape:kbl:matches`

> `roundCode`가 `kbl_ps_*`인 경기만 수집. `미정` 팀은 자동 제외.

---

## 팀코드 매핑

| teamId | 네이버 | KBL | 팀명 | 홈구장 |
|--------|--------|-----|------|--------|
| lg | 50 | lg | 창원 LG 세이커스 | 창원체육관 |
| jkj | 70 | kgc | 안양 정관장 레드부스터스 | 안양 정관장 아레나 |
| sono | 66 | sono | 고양 소노 스카이거너스 | 고양소노아레나 |
| db | 16 | db | 원주 DB 프로미 | 원주DB프로미아레나 |
| kcc | 60 | kcc | 부산 KCC 이지스 | 부산사직체육관 |
| sk | 55 | sk | 서울 SK 나이츠 | 잠실학생체육관 |
| samsungm | 35 | ss | 서울 삼성 썬더스 | 잠실실내체육관 |
| gas | 64 | pega | 대구 한국가스공사 페가수스 | 대구체육관 |
| mobis | 10 | hd | 울산 현대모비스 피버스 | 울산동천체육관 |
| kt | 06 | kt | 수원 KT 소닉붐 | 수원 KT 소닉붐 아레나 |

## 라운드 코드

| roundCode | 의미 | 형식 |
|-----------|------|------|
| `kbl_r` | 정규시즌 | 단판 |
| `kbl_ir` | 비정규(올스타 등) | 단판 |
| `kbl_ps_6_po` | 6강 PO (3위vs6위, 4위vs5위) | 5전 3선승 |
| `kbl_ps_4_po` | 준PO (1위vs6강승자, 2위vs6강승자) | 5전 3선승 |
| `kbl_ps_cp` | 챔피언결정전 | 7전 4선승 |

## 2025-26 플레이오프 구조

```
1위 LG     ─┐
             ├─ 준PO ─┐
6강 승자   ─┘         │
                       ├─ 챔피언결정전
2위 정관장 ─┐         │
             ├─ 준PO ─┘
6강 승자   ─┘

6강: 소노(3) vs SK(6), DB(4) vs KCC(5)
```

## 데이터 소스

| 데이터 | URL 패턴 |
|--------|----------|
| 경기 일정/결과 | `api-gw.sports.naver.com/schedule/games?categoryId=kbl` |
| 박스스코어 | `api-gw.sports.naver.com/schedule/games/{gameId}/record` |
| 팀 로고 SVG | `kbl.or.kr/assets/img/ico/logo/ic-{kblCode}.svg` |
| 선수 사진 | `kbl.or.kr/files/kbl/players-photo/{playerId}.png` |

> KBL 공식 API(`api.kbl.or.kr`)는 `Channel`/`TeamCode`/`X-Requested-With` 헤더 필수, `LeagueKey` enum 불명확 — 현재 미사용.

## 현재 상태 (2026-04-13)

| 파일 | 비고 |
|------|------|
| `scores.json` | 299경기, PO 27경기 포함 |
| `players.json` | 195명, 271경기 기반 시즌 평균 |
| `matches.json` | 6강 PO 10경기 (소노vs SK, DB vs KCC) |
| `teams.json` | 10팀 |
| `national-team.json` | 월드컵예선 W1 12명 + 아시아컵 12명 |
