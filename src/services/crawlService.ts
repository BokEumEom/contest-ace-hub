
import FirecrawlApp from '@mendable/firecrawl-js';

interface CrawledContest {
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

interface CrawlResult {
  success: boolean;
  contests?: CrawledContest[];
  error?: string;
}

interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface MapResult {
  success: boolean;
  links?: string[];
  error?: string;
}

interface SearchResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export class CrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('Firecrawl API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Firecrawl API key');
      const testApp = new FirecrawlApp({ apiKey });
      
      // 간단한 스크래핑 테스트로 API 키 유효성 검증
      const testResult = await testApp.scrapeUrl('https://example.com', {
        formats: ['markdown']
      });
      
      return testResult.success;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }

  static getFirecrawlApp(): FirecrawlApp | null {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;
    
    if (!this.firecrawlApp) {
      this.firecrawlApp = new FirecrawlApp({ apiKey });
    }
    return this.firecrawlApp;
  }

  // /scrape - 단일 페이지 스크래핑
  static async scrapePage(url: string, options: any = {}): Promise<ScrapeResult> {
    const app = this.getFirecrawlApp();
    if (!app) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Scraping page:', url);
      const result = await app.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        ...options
      });

      if (!result.success) {
        return { success: false, error: 'Failed to scrape page' };
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error scraping page:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape page' 
      };
    }
  }

  // /crawl - 여러 페이지 크롤링
  static async crawlContestSite(url: string, options: any = {}): Promise<CrawlResult> {
    const app = this.getFirecrawlApp();
    if (!app) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Crawling website:', url);
      const crawlResponse = await app.crawlUrl(url, {
        limit: 50,
        scrapeOptions: {
          formats: ['markdown'],
        },
        ...options
      });

      if (!crawlResponse.success) {
        return { 
          success: false, 
          error: 'Failed to crawl website' 
        };
      }

      // 크롤링된 데이터를 공모전 형식으로 파싱
      const contests = this.parseContestData(crawlResponse.data);
      
      return { 
        success: true,
        contests 
      };
    } catch (error) {
      console.error('Error during crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to crawl website' 
      };
    }
  }

  // /map - 웹사이트 구조 매핑
  static async mapWebsite(url: string, options: any = {}): Promise<MapResult> {
    const app = this.getFirecrawlApp();
    if (!app) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Mapping website:', url);
      const result = await app.mapUrl(url, {
        ...options
      });

      if (!result.success) {
        return { success: false, error: 'Failed to map website' };
      }

      return { 
        success: true, 
        links: result.links 
      };
    } catch (error) {
      console.error('Error mapping website:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to map website' 
      };
    }
  }

  // /search - 웹사이트 내 검색
  static async searchWebsite(query: string, options: any = {}): Promise<SearchResult> {
    const app = this.getFirecrawlApp();
    if (!app) {
      return { success: false, error: 'API key not found' };
    }

    try {
      console.log('Searching website:', query);
      const result = await app.search(query, {
        limit: 10,
        ...options
      });

      if (!result.success) {
        return { success: false, error: 'Failed to search' };
      }

      return { 
        success: true, 
        data: result.data 
      };
    } catch (error) {
      console.error('Error searching website:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search' 
      };
    }
  }

  private static parseContestData(data: any[]): CrawledContest[] {
    const contests: CrawledContest[] = [];
    
    data.forEach((page) => {
      if (page.markdown) {
        // 간단한 정규표현식으로 공모전 정보 추출
        const contestMatches = this.extractContestInfo(page.markdown, page.metadata?.sourceURL || '');
        contests.push(...contestMatches);
      }
    });

    return contests;
  }

  private static extractContestInfo(markdown: string, sourceUrl: string): CrawledContest[] {
    const contests: CrawledContest[] = [];
    
    // 공모전 관련 키워드로 섹션 찾기
    const lines = markdown.split('\n');
    let currentContest: Partial<CrawledContest> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 제목 패턴 (헤딩이나 굵은 글씨)
      if (line.match(/^#+\s+(.+)|^\*\*(.+)\*\*/) && 
          (line.includes('공모전') || line.includes('대회') || line.includes('경진대회'))) {
        if (currentContest.title) {
          // 이전 공모전 저장
          if (this.isValidContest(currentContest)) {
            contests.push(currentContest as CrawledContest);
          }
        }
        
        currentContest = {
          title: line.replace(/^#+\s+|\*\*/g, ''),
          url: sourceUrl
        };
      }
      
      // 주최기관
      if (line.includes('주최') || line.includes('주관')) {
        currentContest.organization = line.replace(/.*(?:주최|주관)[:\s]*/, '').trim();
      }
      
      // 마감일
      if (line.includes('마감') || line.includes('접수') || line.includes('마감일')) {
        const dateMatch = line.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
        if (dateMatch) {
          currentContest.deadline = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
          // D-day 계산
          const deadlineDate = new Date(currentContest.deadline);
          const today = new Date();
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          currentContest.daysLeft = Math.max(0, diffDays);
        }
      }
      
      // 상금
      if (line.includes('상금') || line.includes('대상') || line.includes('우승')) {
        const prizeMatch = line.match(/(\d{1,3}(?:,\d{3})*)\s*(?:만원|원)/);
        if (prizeMatch) {
          currentContest.prize = `대상 ${prizeMatch[0]}`;
        }
      }
      
      // 카테고리 추론
      if (line.includes('IT') || line.includes('소프트웨어') || line.includes('앱')) {
        currentContest.category = 'IT/기술';
      } else if (line.includes('디자인') || line.includes('포스터')) {
        currentContest.category = '디자인';
      } else if (line.includes('창업') || line.includes('비즈니스')) {
        currentContest.category = '창업/비즈니스';
      } else if (line.includes('마케팅') || line.includes('광고')) {
        currentContest.category = '마케팅';
      } else {
        currentContest.category = currentContest.category || '기타';
      }
      
      // 설명 (첫 번째로 긴 문장을 설명으로 사용)
      if (!currentContest.description && line.length > 30 && !line.includes('마감') && !line.includes('주최')) {
        currentContest.description = line.substring(0, 100) + '...';
      }
    }
    
    // 마지막 공모전 저장
    if (currentContest.title && this.isValidContest(currentContest)) {
      contests.push(currentContest as CrawledContest);
    }
    
    return contests;
  }
  
  private static isValidContest(contest: Partial<CrawledContest>): boolean {
    return !!(contest.title && contest.organization && contest.deadline);
  }
}
