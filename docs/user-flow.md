# 유저 플로우 / IA / 핵심 화면 흐름

본 문서는 README와 별도로 FutsalGo의 정보 구조(IA), 유저 플로우, 핵심 화면 흐름을 요약한다.
경로는 `src/app` 기준의 라우팅 구조를 기반으로 한다.

## 범위

- 로그인/온보딩
- 메인 탐색(메인 레이아웃)
- 팀/일정/매치/선수/게시판/뉴스
- 프로필 및 더보기(설정/피드백)
- 약관/개인정보

## IA (Information Architecture)

### 전역 진입점

- `/` : 메인 홈
- `/login` : 소셜 로그인
- `/onboarding` : 온보딩 플로우

### 메인 레이아웃 그룹 `(main-layout)`

- `/` : 홈
- `/teams` : 팀 목록
  - `/teams/[id]` : 팀 상세
  - `/teams/following` : 팔로우 중인 팀
- `/schedules` : 일정 목록
  - `/schedules/[id]` : 일정 상세
  - `/schedules/my` : 내 일정
- `/players` : 선수 목록
  - `/players/[id]` : 선수 상세
  - `/players/following` : 팔로우 중인 선수
- `/boards` : 게시판 목록
  - `/boards/write` : 게시글 작성
  - `/boards/[id]` : 게시글 상세
  - `/boards/[id]/edit` : 게시글 수정
- `/news` : 토너먼트/뉴스 목록
  - `/news/new` : 뉴스 작성
- `/more` : 더보기
- `/terms` : 이용약관
- `/privacy` : 개인정보처리방침

### 레이아웃 없는 그룹 `(no-layout)`

- 팀 관리
  - `/teams/create` : 팀 생성
  - `/edit-team/[id]` : 팀 편집
  - `/teams/[id]/ratings` : 팀원 평가
- 일정 생성/운영
  - `/schedules/new` : 일정 생성
  - `/schedules/[id]/attendances/[teamId]` : 참석 관리
  - `/schedules/[id]/match/add` : 매치 추가
  - `/schedules/[id]/match/[matchId]` : 매치 진행/기록
- 프로필/피드백
  - `/more/profile` : 프로필 편집
  - `/more/profile/withdraw` : 회원 탈퇴
  - `/more/suggestion` : 기능 제안
  - `/more/bug-report` : 버그 리포트

## 핵심 화면 흐름

### 1) 로그인/온보딩

1. `/login`에서 소셜 로그인
2. 최초 사용자: `/onboarding`으로 이동
3. 온보딩 완료 후 `/` 메인 홈 진입

### 2) 팀 생성 및 운영

1. `/teams` 목록 진입
2. `/teams/create` 팀 생성
3. `/teams/[id]` 팀 상세 확인
4. `/edit-team/[id]` 팀 정보 편집
5. `/teams/[id]/ratings` 팀원 평가

### 3) 일정 생성 및 참석 관리

1. `/schedules` 일정 목록 확인
2. `/schedules/new` 일정 생성
3. `/schedules/[id]` 일정 상세
4. `/schedules/[id]/attendances/[teamId]` 참석 관리

### 4) 매치 진행 및 기록

1. `/schedules/[id]`에서 매치 추가 진입
2. `/schedules/[id]/match/add` 매치 생성
3. `/schedules/[id]/match/[matchId]`에서 라인업/스코어/골 기록

### 5) 선수 탐색 및 팔로우

1. `/players` 선수 목록 확인
2. `/players/[id]` 선수 상세
3. `/players/following` 팔로우 목록 확인

### 6) 커뮤니티(게시판)

1. `/boards` 게시판 목록
2. `/boards/write` 게시글 작성
3. `/boards/[id]` 상세
4. `/boards/[id]/edit` 수정

### 7) 뉴스/토너먼트

1. `/news` 목록
2. `/news/new` 작성

### 8) 프로필/설정/피드백

1. `/more` 더보기 진입
2. `/more/profile` 프로필 수정
3. `/more/profile/withdraw` 탈퇴
4. `/more/suggestion` 기능 제안
5. `/more/bug-report` 버그 리포트

### 9) 약관/개인정보

1. `/terms` 이용약관
2. `/privacy` 개인정보처리방침

## 핵심 화면 리스트 (요약)

- 홈: `/`
- 로그인: `/login`
- 온보딩: `/onboarding`
- 팀 목록/상세: `/teams`, `/teams/[id]`
- 일정 목록/상세: `/schedules`, `/schedules/[id]`
- 선수 목록/상세: `/players`, `/players/[id]`
- 게시판 목록/작성/상세: `/boards`, `/boards/write`, `/boards/[id]`
- 뉴스 목록/작성: `/news`, `/news/new`
- 프로필: `/more/profile`
- 더보기: `/more`
