# Road-In 프로젝트 Handoff 문서 (인수인계서)

이 문서는 다음 AI 에이전트가 프로젝트의 컨텍스트를 파악하고 바로 이어서 작업할 수 있도록 작성된 요약서입니다.

## 1. 프로젝트 개요
- **프로젝트명:** Road-In (에브리커리어)
- **목적:** 수도권 대학생들을 연결하는 풀스택 커뮤니티 플랫폼 MVP 개발
- **주요 타겟:** 대학생, 취준생 (공모전, 스터디, 팀원 모집, AI 멘토링 등)
- **디자인 테마:** 친근하고 신뢰감 있는 블루 톤 (`#3B82F6`) 기반의 캠퍼스픽(CampusPick) 스타일 상단 네비게이션바(GNB) 레이아웃 적용

## 2. 기술 스택 및 구조
현재 프로젝트는 **Monorepo** 형태의 디렉토리 구조를 가집니다.

```text
aingthons/
├── client/ (Frontend)
│   ├── React 18 + Vite + TypeScript
│   ├── 스타일링: Tailwind CSS + shadcn/ui
│   ├── 상태 관리: Zustand (현재 임시 로그인 기능 구현 `useAuthStore.ts`)
│   └── 라우팅: React Router (`App.tsx`, `AppLayout.tsx`)
│
└── server/ (Backend)
    ├── Node.js + Express + TypeScript
    ├── AI 연동: @google/generative-ai (Gemini 1.5 Flash)
    ├── DB (예정): PostgreSQL + Prisma ORM (스키마만 초기 세팅됨)
    └── 핵심 파일: `index.ts` (API 엔드포인트 정의)
```

## 3. 현재까지 구현 완료된 기능 (1순위 ~ 3순위 달성)

### 3.1. 기본 UI 및 대시보드 (프론트엔드)
- **Home (`/`)**: 퀵 메뉴 아이콘, 실시간 인기 공모전, 팀원 모집 글이 요약된 메인 랜딩 대시보드.
- **마이페이지 (`/mypage`)**: Zustand 기반 로그인 세션 체크 후 렌더링. 경험치 바, 코인 현황, 뱃지 UI 구현.
- **온보딩 (`/onboarding`)**: 가입 시 목표와 스펙을 입력받는 유효성 검증 폼(react-hook-form + zod).
- **목록/CRUD 뷰 (`/recruitment`, `/recommendation`, `/team-matching`)**: 탭, 검색바, 필터, 포스터 이미지 그리드를 포함한 세련된 컴포넌트 구현.
- **일정 & 채팅 (`/schedule`, `/chat`)**: 달력(Calendar) 기반 일정 목록 및 카카오톡 스타일의 실시간 채팅 UI.

### 3.2. AI 기능 (풀스택 연동 완료)
`server/index.ts`에 정의된 API를 프론트엔드에서 `fetch`로 호출하여 화면에 띄우는 구조가 완벽히 연동되어 있습니다. (Gemini API 키 환경변수 `GEMINI_API_KEY` 설정 완료)
1. **AI 홍보문 생성 (`/promotion`)**: 모임 정보 입력 시 커뮤니티용 홍보 텍스트 생성 API (`/api/ai/generate-post`).
2. **AI 멘토 매칭 (`/ai-mentoring`)**: 고민 입력 시 가장 적절한 가상의 현직자 선배 2명 추천 API (`/api/ai/mentoring-match`).
3. **AI 스펙 맞춤 추천 (`/ai-matching`)**: 내 스펙 입력 시 부족한 점을 채울 대외활동/공모전 3개 추천 API (`/api/ai/activity-match`).
4. **AI 포트폴리오 피드백 (`/portfolio`)**: 이력서 텍스트 입력 시 강점/보완점/조언 리포트 생성 API (`/api/ai/portfolio-feedback`).

## 4. 실행 방법 (로컬 개발)
터미널 창을 두 개 열고 아래 명령어를 각각 실행합니다.
- **Frontend 실행:** 
  ```bash
  cd client
  npm run dev
  # http://localhost:5173 접속
  ```
- **Backend 실행:**
  ```bash
  cd server
  npm run dev
  # http://localhost:3000 에서 API 서버 가동
  ```

## 5. 완료된 폴리싱 작업 (Priority 5 달성)
- **페이지 트랜지션 애니메이션:** `tailwindcss-animate`를 활용하여 탭 이동 시 페이지가 부드럽게 위로 올라오며 나타나는(`slide-in-from-bottom`) 페이드인 효과를 전역 라우터에 적용했습니다.
- **스켈레톤 로딩 (Skeleton UI):** AI 연동 기능(홍보, 멘토, 매칭, 피드백)에서 로딩 대기 시간 동안 빈 화면 대신 부드럽게 깜빡이는(`animate-pulse`) 스켈레톤 리스트가 표시되도록 개선했습니다.

## 6. 다음 AI 에이전트가 이어서 할 작업 (Next Steps)
1. **실제 데이터베이스 연동 (Prisma + PostgreSQL):**
   - 현재 프론트엔드는 대부분 더미 데이터를 사용 중입니다.
   - `server/prisma/schema.prisma` 스키마를 기반으로 백엔드 CRUD API를 작성하고 프론트엔드와 실제 DB를 연동하는 작업이 가장 최우선 과제입니다.
2. **배포 준비:**
   - 클라우드 VM 인스턴스로 프론트와 백엔드를 배포하기 위한 Nginx 리버스 프록시 및 PM2/Docker 환경 설정이 필요합니다.
