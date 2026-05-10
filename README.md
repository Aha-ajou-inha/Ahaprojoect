# Mapjiri

Mapjiri는 수도권 대학생이 공모전, 스터디, 팀원 모집, 장소 대관, 선배 상담을 한 화면 흐름 안에서 탐색하고 실행할 수 있도록 만든 캠퍼스 성장 지도 서비스입니다. 사용자의 활동을 코인과 성장 레벨로 연결해, 단순 정보 탐색에서 끝나지 않고 다시 참여하게 만드는 것이 핵심입니다.

맵지리는 사용자의 성장을 함께 안내하는 지도 캐릭터입니다. 사용자는 활동을 완료하며 코인을 얻고, `뚜벅이 → 씽씽이 → 따릉이 → 붕붕이 → 우주대장` 단계로 성장합니다. 성장 레벨은 마이페이지와 대관 할인에 반영되어 서비스 전반의 참여 동기가 됩니다.

## 심사위원용 요약

### 문제 정의

대학생 활동 정보는 공모전 사이트, 동아리 커뮤니티, 학교 게시판, 오픈채팅, 스터디룸 예약 서비스에 흩어져 있습니다. Mapjiri는 이 흐름을 하나의 서비스 안에 묶어 대학생이 활동을 찾고, 팀을 만들고, 공간을 예약하고, 선배 상담까지 이어갈 수 있게 합니다.

### 핵심 차별점

- **성장 지도 콘셉트**: 활동 보상, 코인, 이동수단 레벨을 연결해 사용자가 자신의 성장 경로를 직관적으로 확인합니다.
- **대학생 활동 통합**: 공모전, 모집, 대관, 상담, 마이페이지를 하나의 MVP 안에서 시연할 수 있습니다.
- **참여 보상 구조**: 코인을 상담 비용과 대관 할인에 연결해 재방문 이유를 만듭니다.
- **AI 보조 기능**: Gemini API를 활용해 홍보글 생성, 활동 추천, 포트폴리오 피드백, 게시글 검수 기능을 제공합니다.
- **실제 DB 연동 구간 포함**: 공모전, 모집, 팀 프로필 데이터는 Express API와 MySQL 스키마로 연결되어 있습니다.

## 현재 구현된 기능

### 1. 홈화면

- 서비스의 핵심 콘셉트인 성장 지도와 주요 활동 흐름을 보여줍니다.
- 공모전과 팀 프로필 일부를 백엔드 API에서 불러와 홈 피드에 표시합니다.
- 사용자가 다음으로 이동할 수 있는 활동, 모집, 상담, 대관 흐름을 빠르게 파악할 수 있습니다.

### 2. 공모전 & 세미나

- `/recommendation`, `/contests`, `/events` 경로에서 공모전과 행사 정보를 확인할 수 있습니다.
- 공모전 목록은 MySQL `contests` 테이블과 `/api/contests` API를 통해 불러옵니다.
- 검색과 카테고리 기반 탐색 UI를 제공합니다.
- 서버에는 공모전 생성, 수정, 삭제 API도 준비되어 있어 CRUD 확장이 가능합니다.

### 3. 모집

- `/recruitment`, `/studies` 경로에서 스터디, 프로젝트, 동아리 모집 정보를 확인할 수 있습니다.
- 모집 목록은 MySQL `recruitments` 테이블과 `/api/recruitments` API를 통해 불러옵니다.
- 모집 유형, 제목, 분야, 장소, 태그를 기반으로 탐색할 수 있습니다.
- 백엔드에는 모집글 생성, 수정, 삭제 API가 구현되어 있습니다.

### 4. 대관

- `/rentals`, `/rental`, `/rooms` 경로에서 세미나실, 스터디룸, 회의실 대관을 시연할 수 있습니다.
- 공간 카테고리 탭, 지역 필터, 인원 필터, 날짜 필터, 정렬 기능을 제공합니다.
- 성장 레벨에 따라 대관 할인율이 자동 적용됩니다.
- 사용자는 공간을 찜하고, 날짜와 시간을 선택해 예약할 수 있습니다.
- 공간 등록 모달을 통해 새 공간을 추가할 수 있습니다.
- 현재 대관 데이터와 예약 내역은 브라우저 `localStorage`에 저장되는 MVP 방식입니다.

### 5. 상담

- `/mentors`, `/mentors/request`, `/mentors/schedule`, `/mentors/chat` 경로에서 선배 상담 흐름을 시연할 수 있습니다.
- 사용자는 고민 제목, 상담 분야, 상담 방식, 희망 시간, 상세 내용을 입력할 수 있습니다.
- 입력된 고민에 따라 적합한 튜터를 추천하고 상담 스레드를 생성합니다.
- 상담 시간에 따라 코인 비용을 계산하고, 결제 확인 후 상담을 진행하는 흐름을 제공합니다.
- 채팅 UI에서 메시지를 보내면 상담 답변이 이어지는 데모 흐름이 구현되어 있습니다.
- 현재 상담 데이터는 브라우저 `localStorage`에 저장되는 MVP 방식입니다.

### 6. 마이페이지

- `/mypage`, `/coins` 경로에서 사용자의 성장 상태를 확인할 수 있습니다.
- 보유 코인, 현재 이동수단 레벨, 다음 레벨까지 필요한 코인, 대관 할인율을 표시합니다.
- 맵지리 성장 여정, 출석 보상, 오늘의 미션, 코인 활동 내역을 보여줍니다.
- 코인 시스템은 상담 비용과 대관 할인 구조에 연결되어 있습니다.

### 7. 온보딩

- `/onboarding` 경로에서 학교, 전공, 학년, 관심 기술, 목표를 입력할 수 있습니다.
- 현재는 프로필 입력 UI와 폼 검증 중심의 MVP 구현입니다.
- 추후 유저 DB와 연결하면 개인화 추천 데이터로 확장할 수 있습니다.

### 8. AI 기능

- `/promotion`: 모임명, 모집 대상, 키워드를 입력하면 홍보문을 생성합니다.
- `/ai-matching`, `/ai-match`: 사용자의 스펙과 목표를 입력하면 맞춤 활동 추천을 생성합니다.
- `/portfolio`: 포트폴리오 내용을 입력하면 강점, 보완점, 개선 방향 피드백을 생성합니다.
- 자유게시판 검수용 `/api/ai/moderate` API가 구현되어 욕설, 개인정보, 광고성 내용 여부를 검사할 수 있습니다.
- AI 기능은 `GEMINI_API_KEY`가 설정되어 있을 때 정상 동작합니다.

## 구현된 백엔드 API

### 기본

- `GET /api/health`: MySQL 연결 상태 확인

### 공모전

- `GET /api/contests`
- `GET /api/contests/:id`
- `POST /api/contests`
- `PUT /api/contests/:id`
- `DELETE /api/contests/:id`

### 모집

- `GET /api/recruitments`
- `POST /api/recruitments`
- `PUT /api/recruitments/:id`
- `DELETE /api/recruitments/:id`

### 팀 프로필

- `GET /api/team-profiles`
- `POST /api/team-profiles`
- `PUT /api/team-profiles/:id`
- `DELETE /api/team-profiles/:id`

### AI

- `POST /api/ai/generate-post`
- `POST /api/ai/activity-match`
- `POST /api/ai/recommend`
- `POST /api/ai/portfolio-feedback`
- `POST /api/ai/portfolio-review`
- `POST /api/ai/moderate`
- `POST /api/ai/mentoring-match`
- `POST /api/ai/match-mentor`

## MVP 구현 범위

Mapjiri는 해커톤 시연용 MVP입니다. 공모전, 모집, 팀 프로필은 MySQL과 API로 연결되어 있고, 대관과 상담은 빠른 시연을 위해 `localStorage` 기반으로 구현되어 있습니다. 로그인, 실시간 채팅, 실제 결제, 관리자 페이지는 향후 확장 범위입니다.

## 기술 스택

- Client: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand
- Server: Node.js, Express, TypeScript
- Database: MySQL, mysql2
- AI: Google Gemini API

## 폴더 구조

```text
aingthons/
├── client/                 # React/Vite 프론트엔드
│   └── src/
│       ├── assets/         # Mapjiri 로고/워드마크
│       ├── components/     # 공통 UI 및 레이아웃
│       ├── pages/          # 주요 화면
│       ├── lib/            # API, 성장 레벨 유틸
│       └── store/          # 클라이언트 상태
├── server/                 # Express API 서버
│   ├── db/                 # MySQL 스키마
│   ├── scripts/            # DB 초기화 스크립트
│   ├── db.ts               # MySQL 연결
│   └── index.ts            # API 엔트리
└── unilink_project_plan.md # 초기 기획 문서
```

## 실행 전 준비

- Node.js 18 이상
- MySQL 8 이상
- npm
- macOS 사용자는 Homebrew 설치 권장

## Windows 실행 방법

PowerShell 기준입니다.

### 서버

```powershell
cd server
npm install
Copy-Item .env.example .env
```

`server/.env`에서 MySQL 정보를 본인 환경에 맞게 수정합니다.

```env
PORT=3000
GEMINI_API_KEY=

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=aingthons
```

AI 기능을 사용하려면 `GEMINI_API_KEY`에 본인의 Gemini API 키를 넣습니다. 일반 API와 화면 확인은 키 없이도 진행할 수 있습니다.

MySQL 스키마를 초기화합니다.

```powershell
npm run db:init
```

PowerShell에서는 `mysql -u root -p < db\schema.sql` 형식의 리다이렉션이 동작하지 않을 수 있으므로, 위의 `npm run db:init` 사용을 권장합니다.

서버를 시작합니다.

```powershell
npm run dev
```

기본 서버 주소는 `http://localhost:3000`입니다. 상태 확인은 `http://localhost:3000/api/health`에서 할 수 있습니다.

### 클라이언트

새 PowerShell 창에서 실행합니다.

```powershell
cd client
npm install
npm run dev
```

기본 클라이언트 주소는 `http://localhost:5173`입니다. 클라이언트는 기본적으로 `http://localhost:3000` API 서버를 호출합니다.

## macOS 실행 방법

Terminal 또는 iTerm 기준입니다.

### 1. Node.js와 MySQL 설치

Homebrew가 설치되어 있다면 아래 명령으로 필요한 도구를 설치할 수 있습니다.

```bash
brew install node mysql
brew services start mysql
```

이미 Node.js와 MySQL이 설치되어 있다면 이 단계는 건너뛰어도 됩니다.

MySQL 접속이 되는지 확인합니다.

```bash
mysql -u root -p
```

로컬 MySQL root 계정에 비밀번호가 없다면 `server/.env`의 `MYSQL_PASSWORD`를 빈 값으로 두고, 비밀번호가 있다면 해당 값을 넣습니다.

### 2. 서버 실행

```bash
cd server
npm install
cp .env.example .env
```

`server/.env`에서 MySQL 정보를 본인 환경에 맞게 수정합니다.

```env
PORT=3000
GEMINI_API_KEY=

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=aingthons
```

AI 기능을 사용하려면 `GEMINI_API_KEY`에 본인의 Gemini API 키를 넣습니다.

MySQL 스키마를 초기화합니다.

```bash
npm run db:init
```

서버를 시작합니다.

```bash
npm run dev
```

서버 주소는 `http://localhost:3000`입니다.

### 3. 클라이언트 실행

새 터미널 탭을 열고 실행합니다.

```bash
cd client
npm install
npm run dev
```

클라이언트 주소는 `http://localhost:5173`입니다.

서버 주소를 바꿔야 한다면 `client/.env`를 만들고 아래 값을 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 추천 시연 순서

1. `http://localhost:5173`에서 홈화면과 성장 지도 콘셉트를 소개합니다.
2. `공모전&세미나`에서 DB 기반 공모전 목록과 검색 흐름을 보여줍니다.
3. `모집`에서 스터디/프로젝트 모집 정보를 확인합니다.
4. `대관`에서 공간 필터링, 레벨별 할인, 예약, 공간 등록을 시연합니다.
5. `상담`에서 고민 등록, 튜터 추천, 코인 결제, 채팅 흐름을 보여줍니다.
6. `마이페이지`에서 코인, 성장 레벨, 출석 보상, 미션 구조를 설명합니다.
7. 시간이 남으면 `/promotion`, `/ai-matching`, `/portfolio`에서 AI 기능을 시연합니다.

## 빌드 및 점검

클라이언트 빌드:

```bash
cd client
npm run build
```

클라이언트 린트:

```bash
cd client
npm run lint
```

서버 타입 체크:

```bash
cd server
npx tsc --noEmit
```

## 업로드 주의사항

아래 파일과 폴더는 GitHub에 업로드하지 않습니다.

- `.env`, `.env.*`
- `node_modules/`
- `dist/`, `build/`
- `.screenshots/`
- 실제 API 키, DB 비밀번호, 개인 토큰

환경변수 예시는 `server/.env.example`에만 남기고, 실제 값은 각자 로컬의 `.env`에만 저장합니다.
