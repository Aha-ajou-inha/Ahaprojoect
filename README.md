# UniLink

UniLink는 대학생이 공모전, 팀원 모집, 멘토링, 커뮤니티 활동을 한 곳에서 관리할 수 있는 캠퍼스 활동 플랫폼입니다. 사용자는 관심 분야와 역량에 맞는 공모전과 팀을 탐색하고, 멘토링 일정을 확인하며, 마이페이지에서 활동 이력과 코인 미션을 관리할 수 있습니다.

## 주요 기능

- 공모전 추천 및 검색
- 스터디/프로젝트/공모전 팀원 모집
- 팀 매칭 프로필 탐색
- 멘토 목록, 예약 일정, 채팅 화면
- 커뮤니티 통합 화면: 게시판, 동아리, 이벤트
- 마이페이지: 프로필, 활동 현황, 코인, 미션, 뱃지
- AI 기반 활동 추천, 홍보문 생성, 포트폴리오 피드백

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
│       ├── components/     # 공통 UI 및 레이아웃
│       ├── pages/          # 주요 화면
│       ├── lib/            # API 유틸
│       └── store/          # 클라이언트 상태
├── server/                 # Express API 서버
│   ├── db/                 # MySQL 스키마
│   ├── scripts/            # DB 초기화 스크립트
│   ├── db.ts               # MySQL 연결
│   └── index.ts            # API 엔트리
└── unilink_project_plan.md # 프로젝트 기획 문서
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
