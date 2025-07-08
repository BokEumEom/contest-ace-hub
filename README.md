# Contest Ace Hub 🏆

공모전 관리 플랫폼 - 체계적인 공모전 참여를 위한 올인원 솔루션

## 📋 프로젝트 소개

Contest Ace Hub는 공모전 참여자들을 위한 종합 관리 플랫폼입니다. 공모전 등록부터 마감일 관리, 팀 프로젝트 협업까지 모든 과정을 체계적으로 관리할 수 있습니다.

### ✨ 주요 기능

- **📅 공모전 관리**: 등록, 수정, 삭제 및 상태 추적
- **⏰ 마감일 알림**: 임박한 마감일 자동 알림
- **👥 팀 프로젝트**: 팀원 관리 및 협업 기능
- **📊 진행 상황 추적**: 대시보드를 통한 한눈에 보는 현황
- **🎯 AI 도우미**: AI 기반 공모전 참여 가이드
- **📱 반응형 디자인**: 모바일부터 데스크톱까지 완벽 지원
- **🔐 보안**: Supabase를 통한 안전한 데이터 저장

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <YOUR_GIT_URL>
cd contest-ace-hub

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (선택사항)
cp env.template .env
# .env 파일을 편집하여 Supabase 설정 추가

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 애플리케이션을 확인하세요.

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 환경
- **React Router** - 클라이언트 사이드 라우팅
- **React Query** - 서버 상태 관리

### UI/UX
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **shadcn/ui** - 재사용 가능한 컴포넌트
- **Radix UI** - 접근성 높은 프리미티브
- **Lucide React** - 아이콘 라이브러리

### Backend & Database
- **Supabase** - 백엔드 서비스 (인증, 데이터베이스)
- **PostgreSQL** - 관계형 데이터베이스

### 개발 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **TypeScript** - 정적 타입 검사

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── ui/             # shadcn/ui 컴포넌트
│   └── ...             # 커스텀 컴포넌트
├── pages/              # 페이지 컴포넌트
│   ├── Index.tsx       # 대시보드
│   ├── Contests.tsx    # 공모전 목록
│   ├── NewContest.tsx  # 공모전 등록
│   ├── ContestDetail.tsx # 공모전 상세
│   ├── AIHelper.tsx    # AI 도우미
│   ├── Calendar.tsx    # 캘린더 뷰
│   ├── Settings.tsx    # 설정
│   ├── Profile.tsx     # 프로필
│   └── Auth.tsx        # 인증
├── hooks/              # 커스텀 React 훅
├── lib/                # 유틸리티 라이브러리
├── services/           # API 서비스
├── types/              # TypeScript 타입 정의
└── utils/              # 헬퍼 함수
```

## 🔧 환경 설정

### Supabase 설정 (권장)

더 안전한 데이터 저장을 위해 Supabase를 사용하는 것을 권장합니다:

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `.env` 파일에 환경 변수 설정:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. 데이터베이스 테이블 생성 (자세한 내용은 `SUPABASE_SETUP.md` 참조)

### 로컬 스토리지 (기본)

Supabase 설정 없이도 로컬 스토리지를 사용하여 즉시 사용 가능합니다.

## 📱 주요 페이지

### 🏠 대시보드 (Index)
- 진행중인 공모전 현황
- 통계 카드 (진행중, 완료, 팀 프로젝트, 임박한 마감)
- 빠른 작업 메뉴
- 최근 활동 내역

### 📋 공모전 관리
- **목록**: 모든 공모전 조회 및 필터링
- **등록**: 새로운 공모전 추가
- **상세**: 공모전 정보 수정 및 진행 상황 관리

### 🤖 AI 도우미
- 공모전 참여 가이드
- AI 기반 조언 및 팁

### 📅 캘린더
- 마감일 시각화
- 일정 관리

### ⚙️ 설정
- API 키 관리 (Gemini, Firecrawl)
- 사용자 프로필 설정

## 🚀 배포

### Lovable을 통한 배포
1. [Lovable](https://lovable.dev/projects/d738e10e-4da5-4b43-9b3c-c2c01439741c) 접속
2. Share → Publish 클릭

### 수동 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물을 원하는 호스팅 서비스에 배포
```

## 🔗 커스텀 도메인 연결

Lovable 프로젝트에서 커스텀 도메인을 연결할 수 있습니다:
1. Project > Settings > Domains로 이동
2. Connect Domain 클릭
3. [도메인 설정 가이드](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide) 참조

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 있거나 기능 제안이 있으시면 이슈를 생성해 주세요.

---

**Contest Ace Hub** - 공모전 참여의 새로운 기준 🚀
