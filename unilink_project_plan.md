# Road-In — 수도권 대학생 커뮤니티 플랫폼 기획서

> **해커톤**: GDG on Campus INHA X AJOU 2026  
> **주제**: 수도권 지역의 대학생 커뮤니티 발전 방안  
> **개발 기간**: 무박 2일 (오전 10시 마감)

---

## 1. 프로젝트 개요

### 포지셔닝
> "에브리타임이 학교 안이라면, Road-In은 수도권 대학들을 지도 위에서 잇는 플랫폼"

### 문제 정의
| 기존 플랫폼 | 한계 |
|---|---|
| 에브리타임 | 학교 울타리를 벗어나지 못함 |
| 캠퍼스픽 | 전국 단위, 대학 간 연결 약함 |
| 스프/홀라 | 대학생 특화 아님, 세미나 기능 없음 |
| 링커리어 | 취업 중심, 커뮤니티 활동 약함 |

### 해결책
- 수도권 대학 간 연결에 특화
- AI 온보딩으로 맞춤 연결 (스펙 입력 → 목표 선택 → AI 매칭)
- 선배 상담·멘토링 연계
- 보상 시스템(코인·타이틀·미션)으로 재참여 유도
- AI 관리자로 건강한 커뮤니티 유지

---

## 2. 핵심 기능 (11개 화면)

### 화면 목록
| # | 화면 | 핵심 기능 |
|---|---|---|
| 1 | 마이페이지 | EXP / 등급 / 코인 / 뱃지 시스템 |
| 2 | 나의 스펙 & 목표 | 온보딩 입력 폼 (스펙 + 진로 목표) |
| 3 | 코인 & 활동 | 활동 내역 + 코인 현황 + 획득 방법 |
| 4 | AI 고민 등록 | 고민 입력 → Claude API → 상담자 추천 |
| 5 | AI 매칭 추천 | 스펙 기반 선배 / 스터디 / 공모전 추천 |
| 6 | 매칭 후 일정 조율 | 양방향 캘린더 UI로 상담 시간 확정 |
| 7 | 상담 진행 | 채팅 UI (음성/채팅/대면 선택) |
| 8 | 동아리/스터디 모집 | 목록 + 등록 + 필터 |
| 9 | 공모전·행사·세미나 추천 | AI 기반 맞춤 추천 + 목록 |
| 10 | 팀원 매칭 | 역할/스택 태그 기반 모집 |
| 11 | 세미나 영상 & 홍보 | 홍보문 AI 자동 생성 + 영상 등록 |

### 전체 페이지 라우팅
```
/                   홈 (랜딩 + 피드)
/onboarding         온보딩 (스펙 & 목표 입력)
/mypage             마이페이지 (등급/EXP/코인)
/coins              코인 & 활동 내역
/events             행사·세미나 목록 + 등록
/teams              팀원 모집 목록 + 등록
/studies            스터디 모집 목록 + 등록
/contests           공모전 정보 + AI 추천
/mentors            선배 상담 목록
/mentors/request    AI 고민 등록 → 상담자 추천
/mentors/schedule   일정 조율 캘린더
/mentors/chat       상담 진행 (채팅 UI)
/clubs              동아리 콜라보 소통창
/board              자유게시판
/portfolio          포트폴리오 익명 평가
/community          목표별 진로 커뮤니티
/ai-match           AI 매칭 추천 결과
```

---

## 3. AI 기능 상세

모델: `claude-sonnet-4-20250514`

| 기능 | 입력 | 출력 |
|---|---|---|
| 온보딩 AI 매칭 | 스펙 + 목표 | 맞춤 스터디/공모전/선배 추천 |
| 홍보문 자동 생성 | 제목 + 키워드 | 완성된 모집글 본문 |
| 고민 → 상담자 매칭 | 고민 텍스트 | 적합한 선배 추천 + 이유 |
| 포트폴리오 피드백 | 링크 + 설명 | 강점 / 보완점 / 한 줄 총평 |
| 게시글 관리자 필터 | 게시글 내용 | `{ pass: boolean, reason: string }` |
| 공모전 추천 | 스펙 + 관심 분야 | 맞춤 공모전 리스트 |

### AI 관리자 탐지 항목
- 욕설 / 비방 / 혐오표현
- 스팸성 광고
- 개인정보 노출 (전화번호, 계좌번호 등)
- 주제와 무관한 게시글
- 허위 정보

---

## 4. 참여 선순환 루프

```
입력 (1~2번)
    ↓
연결 (AI 매칭)
    ↓
상담 / 활동 (교류·참여)
    ↓
보상 (코인·타이틀)
    ↓
재참여 (지속 참여)
    ↓
커뮤니티 활성화
    ↑_________________________|
```

### 보상 시스템
| 보상 | 획득 조건 | 내용 |
|---|---|---|
| 코인 | 글 작성, 댓글, 상담 제공, 세미나 참가 | 적립 후 상담 신청에 사용 |
| 타이틀 뱃지 | 활동량 누적 | 새벽→탈팀→성장→멘토→마스터→레전드 |
| 주간 미션 | 미션 완료 | 반복 참여 유도, 추가 코인 지급 |

---

## 5. 기술 스택

### Frontend
```
React + Vite
Tailwind CSS
shadcn/ui (컴포넌트 우선 사용, 직접 구현 금지)
Lucide React (아이콘)
React Router
React Hook Form + Zod (폼 검증)
```

### Backend
```
Node.js + Express
Prisma ORM
PostgreSQL
JWT (Access Token 인증)
```

### AI
```
Claude API (claude-sonnet-4-20250514)
ANTHROPIC_API_KEY 환경변수로 관리
```

### 배포
```
클라우드 VM (IP 직접 공유)
포트: client 5173 / server 3000
```

---

## 6. 프로젝트 구조

```
unilink/
├── client/                   # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── MyPage.tsx
│   │   │   ├── Coins.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── Teams.tsx
│   │   │   ├── Studies.tsx
│   │   │   ├── Contests.tsx
│   │   │   ├── Mentors.tsx
│   │   │   ├── MentorRequest.tsx
│   │   │   ├── MentorSchedule.tsx
│   │   │   ├── MentorChat.tsx
│   │   │   ├── Clubs.tsx
│   │   │   ├── Board.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── Community.tsx
│   │   │   └── AiMatch.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FeedCard.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── AiGenerateBtn.tsx
│   │   │   └── ModerationAlert.tsx
│   │   ├── lib/
│   │   │   ├── api.ts          # API 호출 함수
│   │   │   └── utils.ts
│   │   └── main.tsx
│   └── package.json
│
└── server/                   # Express + Prisma
    ├── src/
    │   ├── db.ts              # Prisma Client 인스턴스
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── users.ts
    │   │   ├── events.ts
    │   │   ├── teams.ts
    │   │   ├── studies.ts
    │   │   ├── contests.ts
    │   │   ├── mentors.ts
    │   │   ├── posts.ts
    │   │   └── ai.ts
    │   └── index.ts
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── package.json
```

---

## 7. DB 스키마 (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  password      String
  university    String
  major         String
  year          Int
  stack         String[]
  goal          String
  exp           Int      @default(0)
  coins         Int      @default(0)
  grade         String   @default("새벽")
  createdAt     DateTime @default(now())
}

model Event {
  id          String   @id @default(cuid())
  title       String
  date        DateTime
  location    String
  description String
  category    String
  authorId    String
  createdAt   DateTime @default(now())
}

model Team {
  id          String   @id @default(cuid())
  title       String
  type        String
  description String
  roles       String[]
  stack       String[]
  deadline    DateTime
  maxMembers  Int
  authorId    String
  createdAt   DateTime @default(now())
}

model Study {
  id           String   @id @default(cuid())
  title        String
  subject      String
  description  String
  schedule     String
  location     String
  maxMembers   Int
  currentMembers Int   @default(1)
  stack        String[]
  university   String
  deadline     DateTime
  authorId     String
  createdAt    DateTime @default(now())
}

model Contest {
  id          String   @id @default(cuid())
  title       String
  organizer   String
  deadline    DateTime
  prize       String
  category    String
  teamSize    Int
  url         String
  createdAt   DateTime @default(now())
}

model Mentor {
  id            String   @id @default(cuid())
  userId        String   @unique
  field         String
  career        String
  rating        Float    @default(0)
  consultCount  Int      @default(0)
  coinPerSession Int     @default(50)
  createdAt     DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  category  String
  authorId  String
  likes     Int      @default(0)
  createdAt DateTime @default(now())
}

model Portfolio {
  id        String   @id @default(cuid())
  userId    String
  link      String
  field     String
  aiReview  String?
  createdAt DateTime @default(now())
}

model Comment {
  id          String   @id @default(cuid())
  postId      String
  authorId    String
  content     String
  isAnonymous Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model CoinHistory {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  reason    String
  createdAt DateTime @default(now())
}
```

---

## 8. REST API 명세

### 인증
```
POST   /api/auth/register      회원가입
POST   /api/auth/login         로그인 (JWT 발급)
```

### 유저
```
GET    /api/users/:id          프로필 조회
PUT    /api/users/:id          프로필 수정 (스펙·목표)
```

### 핵심 CRUD
```
GET    /api/events             행사·세미나 목록
POST   /api/events             행사 등록

GET    /api/teams              팀원 모집 목록
POST   /api/teams              팀원 모집 등록

GET    /api/studies            스터디 목록
POST   /api/studies            스터디 등록

GET    /api/contests           공모전 목록
POST   /api/contests           공모전 등록

GET    /api/mentors            선배 목록
POST   /api/mentors/request    상담 신청

GET    /api/posts              자유게시판 목록
POST   /api/posts              게시글 등록
```

### AI 엔드포인트
```
POST   /api/ai/generate-post       홍보문 자동 생성
POST   /api/ai/match-mentor        고민 → 상담자 추천
POST   /api/ai/recommend           스펙 → 맞춤 추천
POST   /api/ai/portfolio-review    포폴 AI 피드백
POST   /api/ai/moderate            게시글 관리자 필터
```

### 인증 방식
```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 9. 디자인 가이드라인

### 컬러 시스템
```
Primary:        #6C63FF
Primary Light:  #EEF0FF
Primary Dark:   #3C3489
Background:     #F8F9FF
Surface:        #FFFFFF
Text Primary:   #1A1A2E
Text Secondary: #6B7280
Success:        #10B981
Warning:        #F59E0B
Error:          #EF4444
```

### 타이포그래피
```
폰트:   Pretendard (한국어 최적화)
H1:     32px / 700
H2:     24px / 700
H3:     18px / 500
Body:   16px / 400
Small:  14px / 400
Tiny:   12px / 400
```

### 컴포넌트 스타일
```
Border radius:  12px (카드) / 8px (버튼·인풋) / 999px (뱃지·태그)
Shadow:         0 2px 12px rgba(0,0,0,0.08) (카드 hover)
Transition:     all 0.2s ease
Hover effect:   translateY(-2px)
```

### UI 컴포넌트 라이브러리 (shadcn/ui 우선)
```
Button, Input, Textarea, Select, Checkbox
Card, Badge, Avatar, Separator
Dialog, Sheet, Drawer, AlertDialog
Tabs, Accordion
DropdownMenu, Popover, Tooltip
Toast, Alert
Table, Pagination
Calendar, DatePicker
Progress, Skeleton
Form (react-hook-form + zod)
```

> shadcn에 없는 경우에만 Tailwind로 직접 구현

---

## 10. 개발 우선순위 & 타임라인

### 개발 우선순위
```
1순위  auth + user + 온보딩 플로우
2순위  행사 / 팀원 / 스터디 / 공모전 CRUD
3순위  AI 기능 5종 연동
4순위  마이페이지 EXP / 코인 / 등급
5순위  선배 상담 + 일정 조율
6순위  UI 다듬기 + 배포
```

### 타임라인 (무박 2일)
| 시간 | 작업 |
|---|---|
| 0 – 1h | 모노레포 세팅 (Vite + Express + Prisma 초기화) |
| 1 – 2h | DB 스키마 설계 + Prisma migrate + Seed 데이터 |
| 2 – 3h | 온보딩 플로우 (스펙 입력 → 목표 → AI 매칭 화면) |
| 3 – 4.5h | 행사·세미나 / 팀원·스터디 페이지 |
| 4.5 – 6h | 공모전 / 선배 상담 / 커뮤니티 페이지 |
| 6 – 7.5h | AI 기능 5종 연동 (Claude API) |
| 7.5 – 9h | 마이페이지 EXP·코인·등급 + 포폴 평가 |
| 9h ~ | UI 다듬기 + Vercel/VM 배포 + 발표 준비 |

---

## 11. 환경 변수

```env
# server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/unilink"
JWT_SECRET="your-jwt-secret"
ANTHROPIC_API_KEY="your-claude-api-key"
PORT=3000

# client/.env
VITE_API_URL="http://localhost:3000"
```

---

## 12. DB 연동 계획 (현재 작업 중)

> 프론트엔드 더미 데이터 → 실제 백엔드 API 연동으로 전환

### 백엔드
- `server/src/db.ts`: Prisma Client 인스턴스 생성
- API 엔드포인트 추가: `/api/contests`, `/api/teams`, `/api/studies`
- Seed 데이터: 서버 최초 실행 시 초기 데이터 자동 삽입

### 프론트엔드
- 더미 데이터 제거: `Recommendation.tsx`, `TeamMatching.tsx`, `Recruitment.tsx`
- `useEffect` + `useState`로 API fetching 적용
- Skeleton 로딩 UI 적용

### 검증 순서
```
1. npx prisma db push       → 테이블 생성 확인
2. 서버 재시작              → Seed 데이터 삽입 확인
3. 브라우저 탭 클릭         → DB 데이터 렌더링 확인
```

### DB 선택 (확인 필요)
- **PostgreSQL**: PC에 설치되어 있다면 그대로 사용 (`.env`에 로컬 DB 주소 필요)
- **SQLite**: 설치 없이 파일 형태로 즉시 사용 가능 → 빠른 개발에 추천

---

## 13. 심사기준 대응 전략

| 영역 | 배점 | 우리 대응 |
|---|---|---|
| 주제 부합성 | 20 | "수도권 대학 간 연결" 직격, 온보딩 → 선순환 루프로 구체성 증명 |
| 창의성 | 20 | AI 관리자·매칭·피드백 3종, 기존 플랫폼 비교 슬라이드 |
| 발표 전달력 | 20 | 포지셔닝 한 줄 + 라이브 AI 데모 시연 |
| 지속 가능성 | 10 | 보상 루프 + 수익 모델 (상담 수수료, 공모전 스폰서) |
| 기술 구현도 | 30 | MVP 오류 없이 작동 + Claude API 실연 + VM 배포 |

### 발표 시나리오 포인트
1. 기존 플랫폼 한계 → 우리 포지션 설명
2. 온보딩 라이브 시연 (AI 매칭)
3. 게시글 작성 → AI 홍보문 생성 실연
4. 부적절 글 작성 → AI 관리자 차단 실연
5. 보상 루프 → 지속 가능성 설명
6. 로드맵 + 수익 모델 한 슬라이드
