// 매직 넘버를 명명된 상수로 대체
export const DEFAULT_CRAWL_LIMIT = 10;
export const DEFAULT_MAP_LIMIT = 5000;
export const DEFAULT_SEARCH_LIMIT = 10;
export const DEFAULT_WAIT_FOR_MS = 1000;
export const DEFAULT_TIMEOUT_MS = 30000;
export const DEFAULT_DAYS_LEFT_THRESHOLD_URGENT = 7;
export const DEFAULT_DAYS_LEFT_THRESHOLD_WARNING = 30;
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// 카테고리 매핑 상수
export const CATEGORY_KEYWORDS = {
  'IT/기술': ['IT', '소프트웨어', '앱'],
  '디자인': ['디자인', '포스터'],
  '창업/비즈니스': ['창업', '비즈니스'],
  '마케팅': ['마케팅', '광고']
} as const;

// 기본 옵션 상수
export const DEFAULT_SCRAPE_OPTIONS = {
  formats: ['markdown'],
  includeTags: '',
  excludeTags: 'script, .ad, #footer',
  onlyMainContent: true,
  removeBase64Images: false,
  waitFor: DEFAULT_WAIT_FOR_MS,
  timeout: DEFAULT_TIMEOUT_MS,
  screenshot: false,
  fullPageScreenshot: false,
  mobile: false,
  skipTlsVerification: false
} as const;

export const DEFAULT_CRAWL_OPTIONS = {
  limit: DEFAULT_CRAWL_LIMIT,
  maxDepth: undefined,
  allowBackwardCrawling: false,
  allowExternalContentLinks: false,
  excludePaths: '',
  includeOnlyPaths: '',
  ignoreSitemap: false,
  scrapeOptions: DEFAULT_SCRAPE_OPTIONS
} as const;

export const DEFAULT_MAP_OPTIONS = {
  search: '',
  ignoreSitemap: false,
  includeSubdomains: false,
  limit: DEFAULT_MAP_LIMIT
} as const;

export const DEFAULT_SEARCH_OPTIONS = {
  limit: DEFAULT_SEARCH_LIMIT,
  tbs: '',
  filter: '',
  lang: 'ko',
  country: 'KR',
  location: ''
} as const; 