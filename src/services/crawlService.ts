
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

export class CrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      return true;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async crawlContestSite(url: string): Promise<CrawlResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const crawlResponse = await this.firecrawlApp.crawlUrl(url, {
        limit: 50,
        scrapeOptions: {
          formats: ['markdown'],
        }
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
