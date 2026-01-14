# FutsalGo ⚽

풋살 팀과 일정을 관리하는 소셜 플랫폼

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [데이터베이스 스키마](#-데이터베이스-스키마)
- [환경 변수](#-환경-변수)
- [개발 가이드](#-개발-가이드)

## 🎯 프로젝트 소개

FutsalGo는 풋살을 즐기는 사람들을 위한 종합 관리 플랫폼입니다. 팀 생성 및 관리, 경기 일정 조율, 참석 투표, 매치 기록 등 풋살 활동에 필요한 모든 기능을 제공합니다.

### 핵심 가치

- **팀 관리**: 쉽고 효율적인 풋살 팀 운영
- **일정 조율**: 스마트한 경기 일정 관리 및 참석 투표
- **소셜 네트워킹**: 선수 및 팀 간 네트워킹
- **기록 관리**: 경기 결과 및 개인 통계 추적

## ✨ 주요 기능

### 👥 사용자 & 인증

- 소셜 로그인 (Google, Kakao, Naver)
- 단계별 온보딩 프로세스
- 프로필 관리 및 능력치 자기평가
- 선수 간 팔로우 시스템

### 🏆 팀 관리

- 팀 생성 및 설정 (로고, 커버 이미지, 소개)
- 팀원 초대 및 승인 시스템
- 팀 역할 관리 (팀장, 부팀장, 멤버)
- 팀 레벨 및 활동 빈도 설정
- 팀 멤버 평가 시스템
- 팀 팔로우 기능

### 📅 일정 & 매치

- **자체전**: 팀 내부 연습 경기
- **친선전**: 다른 팀과의 매치 (초대 및 수락)
- 참석 투표 시스템 (참석/불참/미정)
- 경기 라인업 구성
- 실시간 스코어 기록
- 골 기록 및 어시스트 관리
- MVP 투표
- 경기 사진 업로드 및 공유
- 일정 좋아요 및 댓글

### 📊 통계 & 기록

- 개인 능력치 및 포지션 관리
- 골/어시스트 기록
- 팀별 경기 이력
- 연도별 통계

### 💬 커뮤니티

- 다양한 카테고리 게시판 (자유, 팀)
- 게시글 작성 및 댓글
- 좋아요 및 공유
- 공지사항 및 고정 게시글
- 익명 게시 지원

### 🛠️ 피드백

- 기능 제안
- 버그 리포트
- 첨부파일 지원

## 🛠 기술 스택

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animation**: Motion (Framer Motion)
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Phosphor Icons, Lucide React, Heroicons

### State Management & Data Fetching

- **Server State**: TanStack Query (React Query) v5
- **Client State**: Zustand v5
- **Forms**: React Hook Form + Zod

### Backend & Database

- **ORM**: Prisma 6
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js v5
- **File Upload**: Cloudflare Images

### Architecture & Code Quality

- **Architecture**: FSD (Feature Sliced Design)
- **Linting**: ESLint 9
- **Type Safety**: TypeScript Strict Mode

### Development Tools

- **Package Manager**: npm
- **Node Version**: 20+

## 🚀 시작하기

### 사전 요구사항

- Node.js 20 이상
- npm 또는 yarn
- PostgreSQL 데이터베이스

### 설치 및 실행

1. **저장소 클론**

```bash
git clone <repository-url>
cd kallemalle
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**

`.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"

# OAuth Providers
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_KAKAO_ID="..."
AUTH_KAKAO_SECRET="..."
AUTH_NAVER_ID="..."
AUTH_NAVER_SECRET="..."

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_API_TOKEN="..."
CLOUDFLARE_IMAGES_HASH="..."

# Encryption
ENCRYPTION_KEY="..."
```

4. **데이터베이스 마이그레이션**

```bash
npx prisma migrate dev
```

5. **개발 서버 실행**

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

프로젝트는 **FSD (Feature Sliced Design)** 아키텍처를 따릅니다.

```
kallemalle/
├── prisma/
│   ├── migrations/          # 데이터베이스 마이그레이션
│   └── schema.prisma        # Prisma 스키마 정의
│
├── public/
│   ├── assets/              # 정적 에셋 (이미지, 로고)
│   └── *.svg                # SVG 파일들
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (main-layout)/   # 메인 레이아웃 그룹
│   │   │   ├── boards/      # 게시판
│   │   │   ├── players/     # 선수 목록 및 상세
│   │   │   ├── schedules/   # 일정 목록 및 상세
│   │   │   ├── teams/       # 팀 목록 및 상세
│   │   │   ├── privacy/     # 개인정보처리방침
│   │   │   ├── terms/       # 이용약관
│   │   │   └── more/        # 더보기
│   │   │
│   │   ├── (no-layout)/     # 레이아웃 없는 페이지 그룹
│   │   │   ├── edit-team/   # 팀 편집
│   │   │   ├── schedules/   # 일정 편집/생성
│   │   │   ├── teams/       # 팀 생성/관리
│   │   │   └── more/        # 프로필, 제안, 버그리포트
│   │   │
│   │   ├── api/             # API Routes
│   │   │   ├── auth/        # NextAuth 엔드포인트
│   │   │   └── check/       # 중복 확인 API
│   │   │
│   │   ├── login/           # 로그인 페이지
│   │   ├── onboarding/      # 온보딩 플로우
│   │   └── layout.tsx       # 루트 레이아웃
│   │
│   ├── entities/            # 비즈니스 엔티티
│   │   ├── match/           # 매치 관련 타입 및 상수
│   │   ├── schedule/        # 일정 관련 유틸리티
│   │   ├── team/            # 팀 관련 유틸리티
│   │   └── user/            # 유저 관련 액션 및 타입
│   │
│   ├── features/            # 기능 단위 모듈
│   │   ├── add-schedule/    # 일정 추가
│   │   ├── bug-report/      # 버그 리포트
│   │   ├── feedback/        # 피드백
│   │   ├── filter-list/     # 필터링 기능
│   │   ├── search-address-sgis/ # 주소 검색
│   │   ├── tab-and-search/  # 탭 및 검색
│   │   ├── update-team-logo/ # 팀 로고 업데이트
│   │   └── validation/      # 유효성 검사
│   │
│   ├── shared/              # 공유 리소스
│   │   ├── components/      # 공통 컴포넌트
│   │   │   ├── ui/          # UI 컴포넌트 (shadcn/ui)
│   │   │   ├── providers/   # Context Providers
│   │   │   └── seo/         # SEO 컴포넌트
│   │   ├── config/          # 설정 파일
│   │   ├── constants/       # 상수
│   │   ├── hooks/           # 공용 훅
│   │   ├── lib/             # 유틸리티 함수
│   │   └── types/           # 공용 타입
│   │
│   ├── widgets/             # 복합 UI 블록
│   │   ├── BottomNav.tsx    # 하단 네비게이션
│   │   └── SideNav.tsx      # 사이드 네비게이션
│   │
│   └── middleware.ts        # Next.js 미들웨어
│
├── data/
│   └── legal/               # 약관 및 정책 문서
│
└── package.json
```

### FSD 레이어 설명

#### `app/` - Application Layer

- Next.js App Router 파일들
- 라우팅 및 페이지 구성
- 레이아웃 그룹화

#### `entities/` - Business Entities

- 비즈니스 도메인 엔티티
- 도메인별 타입, 상수, 기본 액션
- 재사용 가능한 비즈니스 로직

#### `features/` - Features

- 사용자 기능 단위 모듈
- 특정 기능의 UI + 로직
- 독립적으로 동작 가능

#### `shared/` - Shared Resources

- 프로젝트 전체에서 사용되는 공통 코드
- UI 컴포넌트, 유틸리티, 설정
- 비즈니스 로직 없음

#### `widgets/` - Widgets

- 복잡한 UI 블록
- 여러 features의 조합
- 페이지 레벨 컴포넌트

### 네이밍 컨벤션

- **컴포넌트 파일**: PascalCase (예: `TeamCard.tsx`)
- **함수/Hook/유틸리티**: kebab-case (예: `use-navigation.tsx`, `format-date.ts`)
- **폴더**: kebab-case (예: `user-profile/`)

## 🗄️ 데이터베이스 스키마

주요 모델 관계:

```
User
  ├─ Account (소셜 로그인)
  ├─ Session
  ├─ TeamMember (팀 멤버십)
  ├─ UserFollow (팔로우)
  ├─ TeamFollow (팀 팔로우)
  ├─ Schedule (생성한 일정)
  ├─ ScheduleAttendance (일정 참석)
  ├─ Match (생성한 매치)
  ├─ Lineup (라인업)
  ├─ GoalRecord (골/어시스트)
  ├─ Post (게시글)
  └─ Feedback/BugReport

Team
  ├─ TeamMember (멤버)
  ├─ Schedule (호스트/초대)
  ├─ Match (홈/어웨이)
  ├─ TeamMemberRating (멤버 평가)
  ├─ Board (팀 게시판)
  └─ TeamFollow (팔로워)

Schedule
  ├─ TeamMatchInvitation (매치 초대)
  ├─ Match (경기)
  ├─ ScheduleAttendance (참석자)
  ├─ ScheduleComment (댓글)
  ├─ SchedulePhoto (사진)
  └─ ScheduleLike (좋아요)

Board
  └─ Post (게시글)
      ├─ PostComment (댓글)
      ├─ PostLike (좋아요)
      └─ PostAttachment (첨부파일)
```

### 주요 Enum 타입

- **Position**: `PIVO`, `ALA`, `FIXO`, `GOLEIRO`
- **TeamMemberRole**: `OWNER`, `MANAGER`, `MEMBER`
- **ScheduleStatus**: `PENDING`, `CONFIRMED`, `READY`, `PLAY`, `REJECTED`, `DELETED`
- **AttendanceStatus**: `UNDECIDED`, `ATTENDING`, `NOT_ATTENDING`
- **PlayerSkillLevel**: `BEGINNER`, `AMATEUR`, `ACE`, `SEMIPRO`
- **TeamLevel**: `VERY_LOW`, `LOW`, `MID`, `HIGH`, `VERY_HIGH`

자세한 스키마는 `prisma/schema.prisma`를 참조하세요.

## 🔐 환경 변수

### 필수 환경 변수

| 변수명           | 설명                          | 예시                    |
| ---------------- | ----------------------------- | ----------------------- |
| `DATABASE_URL`   | PostgreSQL 연결 URL (Pooling) | `postgresql://...`      |
| `DIRECT_URL`     | PostgreSQL 직접 연결 URL      | `postgresql://...`      |
| `AUTH_SECRET`    | NextAuth 암호화 키            | 랜덤 문자열             |
| `AUTH_URL`       | 애플리케이션 URL              | `http://localhost:3000` |
| `ENCRYPTION_KEY` | 데이터 암호화 키 (32바이트)   | 랜덤 hex 문자열         |

### OAuth 설정

| 변수명               | 설명                       |
| -------------------- | -------------------------- |
| `AUTH_GOOGLE_ID`     | Google OAuth Client ID     |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `AUTH_KAKAO_ID`      | Kakao OAuth Client ID      |
| `AUTH_KAKAO_SECRET`  | Kakao OAuth Client Secret  |
| `AUTH_NAVER_ID`      | Naver OAuth Client ID      |
| `AUTH_NAVER_SECRET`  | Naver OAuth Client Secret  |

### Cloudflare Images

| 변수명                   | 설명                   |
| ------------------------ | ---------------------- |
| `CLOUDFLARE_ACCOUNT_ID`  | Cloudflare 계정 ID     |
| `CLOUDFLARE_API_TOKEN`   | Cloudflare API 토큰    |
| `CLOUDFLARE_IMAGES_HASH` | Cloudflare Images Hash |

## 👨‍💻 개발 가이드

### Prisma 사용

```bash
# 스키마 변경 후 마이그레이션 생성
npx prisma migrate dev --name migration_name

# Prisma Studio 실행 (DB 확인)
npx prisma studio

# Prisma Client 재생성
npx prisma generate
```

### 코드 스타일

- **DRY 원칙** 준수
- **JSDoc** 주석 필수 (`@param`, `@returns`)
- 최신 React 19 기능 활용
- `motion/react` 최신 문법 사용
- next-intl 공식 문서 참조

### 주요 라이브러리 공식 문서

- [Next.js 15](https://nextjs.org/docs)
- [React 19](https://react.dev)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://authjs.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [Motion](https://motion.dev/docs)
- [next-intl](https://next-intl.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs)

### Git 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 및 설정 변경
```

## 📝 라이센스

Private Project

---

**FutsalGo** - 풋살을 더 즐겁게 🥅⚽
