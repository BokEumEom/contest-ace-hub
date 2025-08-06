// 매직 넘버를 명명된 상수로 대체
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
export const DEFAULT_TEAM_MEMBERS = 1;
export const MIN_TEAM_MEMBERS = 1;
export const MAX_TEAM_MEMBERS = 20;
export const DEFAULT_PROGRESS = 0;
export const DEFAULT_STATUS = 'preparing' as const;

// AI 입력 방법 타입
export const AI_METHODS = {
  URL: 'url',
  TEXT: 'text'
} as const;

// 폼 섹션 상수
export const FORM_SECTIONS = {
  BASIC_INFO: 'basic-info',
  DETAILED_INFO: 'detailed-info',
  SCHEDULE_PROCEDURE: 'schedule-procedure',
  PRIZE_PRECAUTIONS: 'prize-precautions'
} as const;

// 기본 폼 데이터
export const DEFAULT_FORM_DATA = {
  title: '',
  organization: '',
  deadline: '',
  category: '',
  prize: '',
  description: '',
  teamMembers: DEFAULT_TEAM_MEMBERS,
  contestTheme: '',
  submissionFormat: '',
  contestSchedule: '',
  submissionMethod: '',
  prizeDetails: '',
  resultAnnouncement: '',
  precautions: '',
  contestUrl: '',
} as const;

// 필수 필드 목록
export const REQUIRED_FIELDS = ['title', 'organization', 'deadline'] as const;

// AI 입력 예시 텍스트
export const AI_TEXT_EXAMPLE = `공모전 정보를 텍스트로 붙여넣으세요. 예시:

2024 스마트시티 아이디어 공모전
주최: 과학기술정보통신부
마감일: 2024-12-31
상금: 대상 500만원, 우승 300만원
공모 주제: 미래 도시를 위한 혁신적인 아이디어
제출 형식: PDF 10페이지 이하, 이미지 파일 포함
제출 방법: 온라인 제출 시스템을 통한 제출
결과 발표: 2025년 1월 15일
주의사항: 개인 또는 팀(최대 3명) 참가 가능`;

// 제출 형식 예시
export const SUBMISSION_FORMAT_EXAMPLE = `예: 이미지 형식: JPEG, JPG, PNG (300dpi 이상, 3:2 또는 2:3 비율, 30MB 이하)
PDF: A4 10페이지 이하
동영상: MP4, 3분 이하, 100MB 이하`; 