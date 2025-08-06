export interface CrawledContest {
  title: string;
  organization: string;
  deadline: string;
  category: string;
  prize: string;
  description: string;
  url: string;
  participants?: number;
  daysLeft?: number;
}

export interface ScrapeOptions {
  formats: string[];
  includeTags: string;
  excludeTags: string;
  onlyMainContent: boolean;
  removeBase64Images: boolean;
  waitFor: number;
  timeout: number;
  screenshot: boolean;
  fullPageScreenshot: boolean;
  mobile: boolean;
  skipTlsVerification: boolean;
  headers?: Record<string, string>;
  parsePDF?: boolean;
  actions?: any[];
}

export interface CrawlOptions {
  limit: number;
  maxDepth?: number;
  allowBackwardCrawling: boolean;
  allowExternalContentLinks: boolean;
  excludePaths: string;
  includeOnlyPaths: string;
  ignoreSitemap: boolean;
  webhook?: string;
  scrapeOptions: ScrapeOptions;
}

export interface MapOptions {
  search: string;
  ignoreSitemap: boolean;
  includeSubdomains: boolean;
  limit: number;
}

export interface SearchOptions {
  limit: number;
  tbs: string;
  filter: string;
  lang: string;
  country: string;
  location: string;
}

export interface ContestRegistrationData {
  title: string;
  organization: string;
  deadline: string;
  category: string;
  prize: string;
  description: string;
  status: 'preparing';
  days_left: number;
  progress: number;
  team_members_count: number;
  contest_url: string;
  contest_theme: string;
  submission_format: string;
  contest_schedule: string;
  submission_method: string;
  prize_details: string;
  result_announcement: string;
  precautions: string;
} 