import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CrawlService } from '@/services/crawlService';
import { useContests } from '@/hooks/useContests';
import { Globe, Search, MapPin, Layers, Clock, Building2, Award, Settings, Plus } from 'lucide-react';

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

interface CrawlOptions {
  limit: number;
  maxDepth?: number;
  allowBackwardCrawling: boolean;
  allowExternalContentLinks: boolean;
  excludePaths: string;
  includeOnlyPaths: string;
  ignoreSitemap: boolean;
  webhook?: string;
  scrapeOptions: {
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
  };
}

interface ScrapeOptions {
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

interface MapOptions {
  search: string;
  ignoreSitemap: boolean;
  includeSubdomains: boolean;
  limit: number;
}

interface SearchOptions {
  limit: number;
  tbs: string;
  filter: string;
  lang: string;
  country: string;
  location: string;
}

const ContestCrawler: React.FC = () => {
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contests, setContests] = useState<CrawledContest[]>([]);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [mapData, setMapData] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const { addContest } = useContests();
  
  // Options state
  const [crawlOptions, setCrawlOptions] = useState<CrawlOptions>({
    limit: 10,
    maxDepth: undefined,
    allowBackwardCrawling: false,
    allowExternalContentLinks: false,
    excludePaths: '',
    includeOnlyPaths: '',
    ignoreSitemap: false,
    scrapeOptions: {
      formats: ['markdown'],
      includeTags: '',
      excludeTags: 'script, .ad, #footer',
      onlyMainContent: true,
      removeBase64Images: false,
      waitFor: 1000,
      timeout: 30000,
      screenshot: false,
      fullPageScreenshot: false,
      mobile: false,
      skipTlsVerification: false
    }
  });
  
  const [scrapeOptions, setScrapeOptions] = useState<ScrapeOptions>({
    formats: ['markdown'],
    includeTags: '',
    excludeTags: 'script, .ad, #footer',
    onlyMainContent: true,
    removeBase64Images: false,
    waitFor: 1000,
    timeout: 30000,
    screenshot: false,
    fullPageScreenshot: false,
    mobile: false,
    skipTlsVerification: false
  });
  
  const [mapOptions, setMapOptions] = useState<MapOptions>({
    search: '',
    ignoreSitemap: false,
    includeSubdomains: false,
    limit: 5000
  });
  
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    limit: 10,
    tbs: '',
    filter: '',
    lang: 'ko',
    country: 'KR',
    location: ''
  });

  const { toast } = useToast();

  const apiKey = CrawlService.getApiKey();

  // 크롤링된 공모전을 실제 공모전으로 등록하는 함수
  const handleRegisterContest = (crawledContest: CrawledContest) => {
    try {
      const deadlineDate = new Date(crawledContest.deadline);
      const today = new Date();
      const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const newContest = addContest({
        title: crawledContest.title,
        organization: crawledContest.organization,
        deadline: crawledContest.deadline,
        category: crawledContest.category,
        prize: crawledContest.prize,
        description: crawledContest.description,
        status: 'preparing' as const,
        daysLeft: Math.max(0, daysLeft),
        progress: 0,
        teamMembers: 1,
        contestUrl: crawledContest.url,
        contestTheme: '',
        submissionFormat: '',
        contestSchedule: '',
        submissionMethod: '',
        prizeDetails: crawledContest.prize,
        resultAnnouncement: '',
        precautions: ''
      });

      toast({
        title: "성공",
        description: `"${crawledContest.title}" 공모전이 등록되었습니다.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error registering contest:', error);
      toast({
        title: "오류",
        description: "공모전 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 스크래핑된 데이터에서 공모전 정보를 추출하여 등록하는 함수
  const handleRegisterFromScrapedData = () => {
    if (!scrapedData) return;

    try {
      // 스크래핑된 데이터에서 공모전 정보 추출
      const markdown = scrapedData.markdown || '';
      const title = extractTitle(markdown) || '크롤링된 공모전';
      const organization = extractOrganization(markdown) || '미상';
      const deadline = extractDeadline(markdown) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const category = extractCategory(markdown) || '기타';
      const prize = extractPrize(markdown) || '상금 미공개';
      const description = extractDescription(markdown) || markdown.substring(0, 200) + '...';

      const deadlineDate = new Date(deadline);
      const today = new Date();
      const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const newContest = addContest({
        title,
        organization,
        deadline,
        category,
        prize,
        description,
        status: 'preparing' as const,
        daysLeft: Math.max(0, daysLeft),
        progress: 0,
        teamMembers: 1,
        contestUrl: url,
        contestTheme: '',
        submissionFormat: '',
        contestSchedule: '',
        submissionMethod: '',
        prizeDetails: prize,
        resultAnnouncement: '',
        precautions: ''
      });

      toast({
        title: "성공",
        description: "스크래핑된 데이터로부터 공모전이 등록되었습니다.",
        duration: 3000
      });
    } catch (error) {
      console.error('Error registering contest from scraped data:', error);
      toast({
        title: "오류",
        description: "공모전 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  // 텍스트에서 정보 추출 헬퍼 함수들
  const extractTitle = (text: string): string | null => {
    const titleMatch = text.match(/^#+\s+(.+)|^\*\*(.+)\*\*/m);
    if (titleMatch) return titleMatch[1] || titleMatch[2];
    const lines = text.split('\n');
    for (const line of lines.slice(0, 10)) {
      if (line.includes('공모전') || line.includes('대회') || line.includes('경진대회')) {
        return line.trim();
      }
    }
    return null;
  };

  const extractOrganization = (text: string): string | null => {
    const orgMatch = text.match(/(?:주최|주관)[:\s]*([^\n]+)/);
    return orgMatch ? orgMatch[1].trim() : null;
  };

  const extractDeadline = (text: string): string | null => {
    const dateMatch = text.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    return dateMatch ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}` : null;
  };

  const extractCategory = (text: string): string => {
    if (text.includes('IT') || text.includes('소프트웨어') || text.includes('앱')) return 'IT/기술';
    if (text.includes('디자인') || text.includes('포스터')) return '디자인';
    if (text.includes('창업') || text.includes('비즈니스')) return '창업/비즈니스';
    if (text.includes('마케팅') || text.includes('광고')) return '마케팅';
    return '기타';
  };

  const extractPrize = (text: string): string | null => {
    const prizeMatch = text.match(/(?:상금|대상|우승)[:\s]*([^\n]+)/);
    return prizeMatch ? prizeMatch[1].trim() : null;
  };

  const extractDescription = (text: string): string | null => {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.length > 30 && !line.includes('마감') && !line.includes('주최')) {
        return line.trim();
      }
    }
    return null;
  };

  if (!apiKey) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API 키 필요
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            크롤링 기능을 사용하려면 먼저 설정에서 Firecrawl API 키를 설정해주세요.
          </p>
          <Button onClick={() => window.location.href = '/settings'} className="w-full">
            설정으로 이동
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleCrawl = async () => {
    if (!url.trim()) {
      toast({
        title: "오류",
        description: "URL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setContests([]);
    
    try {
      console.log('Starting crawl for URL:', url);
      const options = {
        limit: crawlOptions.limit,
        allowBackwardCrawling: crawlOptions.allowBackwardCrawling,
        allowExternalContentLinks: crawlOptions.allowExternalContentLinks,
        scrapeOptions: {
          formats: ['markdown'],
          includeTags: crawlOptions.scrapeOptions.includeTags,
          excludeTags: crawlOptions.scrapeOptions.excludeTags,
          onlyMainContent: crawlOptions.scrapeOptions.onlyMainContent,
          waitFor: crawlOptions.scrapeOptions.waitFor
        }
      };
      
      const result = await CrawlService.crawlContestSite(url, options);
      
      if (result.success && result.contests) {
        let filteredContests = result.contests;
        
        if (keywords.trim()) {
          const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
          filteredContests = result.contests.filter(contest =>
            keywordList.some(keyword =>
              contest.title.toLowerCase().includes(keyword) ||
              contest.description.toLowerCase().includes(keyword) ||
              contest.category.toLowerCase().includes(keyword)
            )
          );
        }
        
        setContests(filteredContests);
        toast({
          title: "성공",
          description: `${filteredContests.length}개의 공모전을 찾았습니다.`
        });
      } else {
        toast({
          title: "오류",
          description: result.error || "크롤링에 실패했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Crawl error:', error);
      toast({
        title: "오류",
        description: "크롤링 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!url.trim()) {
      toast({
        title: "오류",
        description: "URL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const options = {
        formats: scrapeOptions.formats,
        includeTags: scrapeOptions.includeTags,
        excludeTags: scrapeOptions.excludeTags,
        onlyMainContent: scrapeOptions.onlyMainContent,
        waitFor: scrapeOptions.waitFor,
        timeout: scrapeOptions.timeout
      };
      
      const result = await CrawlService.scrapePage(url, options);
      
      if (result.success) {
        setScrapedData(result.data);
        toast({
          title: "성공",
          description: "페이지를 성공적으로 스크래핑했습니다."
        });
      } else {
        toast({
          title: "오류",
          description: result.error || "스크래핑에 실패했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "스크래핑 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMap = async () => {
    if (!url.trim()) {
      toast({
        title: "오류",
        description: "URL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const options = {
        search: mapOptions.search,
        ignoreSitemap: mapOptions.ignoreSitemap,
        includeSubdomains: mapOptions.includeSubdomains,
        limit: mapOptions.limit
      };
      
      const result = await CrawlService.mapWebsite(url, options);
      
      if (result.success && result.links) {
        setMapData(result.links);
        toast({
          title: "성공",
          description: `${result.links.length}개의 링크를 발견했습니다.`
        });
      } else {
        toast({
          title: "오류",
          description: result.error || "웹사이트 매핑에 실패했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "매핑 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "오류",
        description: "검색어를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const options = {
        limit: searchOptions.limit,
        tbs: searchOptions.tbs,
        filter: searchOptions.filter,
        lang: searchOptions.lang,
        country: searchOptions.country,
        location: searchOptions.location
      };
      
      const result = await CrawlService.searchWebsite(searchQuery, options);
      
      if (result.success && result.data) {
        setSearchResults(result.data);
        toast({
          title: "성공",
          description: `${result.data.length}개의 결과를 찾았습니다.`
        });
      } else {
        toast({
          title: "오류",
          description: result.error || "검색에 실패했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "검색 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="scrape" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scrape">스크래핑</TabsTrigger>
          <TabsTrigger value="crawl">크롤링</TabsTrigger>
          <TabsTrigger value="map">매핑</TabsTrigger>
          <TabsTrigger value="search">검색</TabsTrigger>
        </TabsList>

        <TabsContent value="scrape" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  페이지 스크래핑
                </CardTitle>
                <CardDescription>
                  단일 페이지의 내용을 추출합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">페이지 URL</label>
                  <Input
                    placeholder="https://example.com/page"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleScrape}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "스크래핑 중..." : "페이지 스크래핑"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Page Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Exclude Tags</Label>
                  <Input
                    placeholder="script, .ad, #footer"
                    value={scrapeOptions.excludeTags}
                    onChange={(e) => setScrapeOptions({...scrapeOptions, excludeTags: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Include Only Tags</Label>
                  <Input
                    placeholder="article, .content, #main"
                    value={scrapeOptions.includeTags}
                    onChange={(e) => setScrapeOptions({...scrapeOptions, includeTags: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Wait for (ms)</Label>
                  <Input
                    type="number"
                    value={scrapeOptions.waitFor}
                    onChange={(e) => setScrapeOptions({...scrapeOptions, waitFor: parseInt(e.target.value) || 1000})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={scrapeOptions.timeout}
                    onChange={(e) => setScrapeOptions({...scrapeOptions, timeout: parseInt(e.target.value) || 30000})}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="main-content"
                    checked={scrapeOptions.onlyMainContent}
                    onCheckedChange={(checked) => setScrapeOptions({...scrapeOptions, onlyMainContent: !!checked})}
                  />
                  <Label htmlFor="main-content">Extract only main content</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobile"
                    checked={scrapeOptions.mobile}
                    onCheckedChange={(checked) => setScrapeOptions({...scrapeOptions, mobile: !!checked})}
                  />
                  <Label htmlFor="mobile">Mobile view</Label>
                </div>

                <div className="space-y-2">
                  <Label>Output Formats</Label>
                  <div className="space-y-2">
                    {['markdown', 'links', 'html', 'rawHtml', 'screenshot'].map((format) => (
                      <div key={format} className="flex items-center space-x-2">
                        <Checkbox
                          id={`format-${format}`}
                          checked={scrapeOptions.formats.includes(format)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setScrapeOptions({
                                ...scrapeOptions,
                                formats: [...scrapeOptions.formats, format]
                              });
                            } else {
                              setScrapeOptions({
                                ...scrapeOptions,
                                formats: scrapeOptions.formats.filter(f => f !== format)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`format-${format}`}>{format}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="full-page-screenshot"
                    checked={scrapeOptions.fullPageScreenshot}
                    onCheckedChange={(checked) => setScrapeOptions({...scrapeOptions, fullPageScreenshot: !!checked})}
                  />
                  <Label htmlFor="full-page-screenshot">Full page screenshot</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {scrapedData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>스크래핑 결과</CardTitle>
                  <Button
                    onClick={handleRegisterFromScrapedData}
                    className="contest-button-primary"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    공모전으로 등록
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                  {JSON.stringify(scrapedData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="crawl" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  웹사이트 크롤링
                </CardTitle>
                <CardDescription>
                  웹사이트 전체를 크롤링하여 공모전 정보를 추출합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">웹사이트 URL</label>
                  <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">키워드 필터 (쉼표로 구분)</label>
                  <Input
                    placeholder="공모전, 대회, 경진대회"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleCrawl}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "크롤링 중..." : "크롤링 시작"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Crawler Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crawl-limit">Limit</Label>
                  <Input
                    id="crawl-limit"
                    type="number"
                    value={crawlOptions.limit}
                    onChange={(e) => setCrawlOptions({...crawlOptions, limit: parseInt(e.target.value) || 10})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-depth">Max depth</Label>
                  <Input
                    id="max-depth"
                    type="number"
                    placeholder="Enter max depth"
                    value={crawlOptions.maxDepth || ''}
                    onChange={(e) => setCrawlOptions({...crawlOptions, maxDepth: e.target.value ? parseInt(e.target.value) : undefined})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Exclude Paths</Label>
                  <Input
                    placeholder="(blog/.+|about/.+)"
                    value={crawlOptions.excludePaths}
                    onChange={(e) => setCrawlOptions({...crawlOptions, excludePaths: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Include Only Paths</Label>
                  <Input
                    placeholder="articles/.+"
                    value={crawlOptions.includeOnlyPaths}
                    onChange={(e) => setCrawlOptions({...crawlOptions, includeOnlyPaths: e.target.value})}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ignore-sitemap"
                      checked={crawlOptions.ignoreSitemap}
                      onCheckedChange={(checked) => setCrawlOptions({...crawlOptions, ignoreSitemap: !!checked})}
                    />
                    <Label htmlFor="ignore-sitemap">Ignore sitemap</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="backward-crawling"
                      checked={crawlOptions.allowBackwardCrawling}
                      onCheckedChange={(checked) => setCrawlOptions({...crawlOptions, allowBackwardCrawling: !!checked})}
                    />
                    <Label htmlFor="backward-crawling">Allow backwards links</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Page Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Exclude Tags</Label>
                  <Input
                    placeholder="script, .ad, #footer"
                    value={crawlOptions.scrapeOptions.excludeTags}
                    onChange={(e) => setCrawlOptions({
                      ...crawlOptions,
                      scrapeOptions: {...crawlOptions.scrapeOptions, excludeTags: e.target.value}
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Include Only Tags</Label>
                  <Input
                    placeholder="article, .content, #main"
                    value={crawlOptions.scrapeOptions.includeTags}
                    onChange={(e) => setCrawlOptions({
                      ...crawlOptions,
                      scrapeOptions: {...crawlOptions.scrapeOptions, includeTags: e.target.value}
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Wait for (ms)</Label>
                  <Input
                    type="number"
                    value={crawlOptions.scrapeOptions.waitFor}
                    onChange={(e) => setCrawlOptions({
                      ...crawlOptions,
                      scrapeOptions: {...crawlOptions.scrapeOptions, waitFor: parseInt(e.target.value) || 1000}
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={crawlOptions.scrapeOptions.timeout}
                    onChange={(e) => setCrawlOptions({
                      ...crawlOptions,
                      scrapeOptions: {...crawlOptions.scrapeOptions, timeout: parseInt(e.target.value) || 30000}
                    })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="crawl-main-content"
                    checked={crawlOptions.scrapeOptions.onlyMainContent}
                    onCheckedChange={(checked) => setCrawlOptions({
                      ...crawlOptions,
                      scrapeOptions: {...crawlOptions.scrapeOptions, onlyMainContent: !!checked}
                    })}
                  />
                  <Label htmlFor="crawl-main-content">Extract only main content</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="crawl-mobile"
                    checked={crawlOptions.scrapeOptions.mobile}
                    onCheckedChange={(checked) => setCrawlOptions({
                      ...crawlOptions,
                      scrapeOptions: {...crawlOptions.scrapeOptions, mobile: !!checked}
                    })}
                  />
                  <Label htmlFor="crawl-mobile">Mobile view</Label>
                </div>

                <div className="space-y-2">
                  <Label>Output Formats</Label>
                  <div className="space-y-2">
                    {['markdown', 'links', 'html', 'rawHtml', 'screenshot'].map((format) => (
                      <div key={format} className="flex items-center space-x-2">
                        <Checkbox
                          id={`crawl-format-${format}`}
                          checked={crawlOptions.scrapeOptions.formats.includes(format)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCrawlOptions({
                                ...crawlOptions,
                                scrapeOptions: {
                                  ...crawlOptions.scrapeOptions,
                                  formats: [...crawlOptions.scrapeOptions.formats, format]
                                }
                              });
                            } else {
                              setCrawlOptions({
                                ...crawlOptions,
                                scrapeOptions: {
                                  ...crawlOptions.scrapeOptions,
                                  formats: crawlOptions.scrapeOptions.formats.filter(f => f !== format)
                                }
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`crawl-format-${format}`}>{format}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="crawl-full-page-screenshot"
                    checked={crawlOptions.scrapeOptions.fullPageScreenshot}
                    onCheckedChange={(checked) => setCrawlOptions({
                      ...crawlOptions,
                      scrapeOptions: {...crawlOptions.scrapeOptions, fullPageScreenshot: !!checked}
                    })}
                  />
                  <Label htmlFor="crawl-full-page-screenshot">Full page screenshot</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {contests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">발견된 공모전 ({contests.length}개)</h3>
              <div className="grid gap-4">
                {contests.map((contest, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{contest.title}</CardTitle>
                        <Badge variant="secondary">{contest.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{contest.organization}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {contest.deadline}
                            {contest.daysLeft !== undefined && (
                              <span className="ml-1 text-orange-600">
                                (D-{contest.daysLeft})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>{contest.prize}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {contest.description}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(contest.url, '_blank')}
                        >
                          자세히 보기
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRegisterContest(contest)}
                          className="contest-button-primary"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          공모전 등록
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  웹사이트 매핑
                </CardTitle>
                <CardDescription>
                  웹사이트의 구조를 파악하고 모든 링크를 찾습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">웹사이트 URL</label>
                  <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleMap}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "매핑 중..." : "웹사이트 매핑"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  매핑 옵션
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="map-search">검색 키워드</Label>
                  <Input
                    id="map-search"
                    placeholder="특정 키워드 포함 링크만"
                    value={mapOptions.search}
                    onChange={(e) => setMapOptions({...mapOptions, search: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ignore-sitemap"
                      checked={mapOptions.ignoreSitemap}
                      onCheckedChange={(checked) => setMapOptions({...mapOptions, ignoreSitemap: !!checked})}
                    />
                    <Label htmlFor="ignore-sitemap">사이트맵 무시</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-subdomains"
                      checked={mapOptions.includeSubdomains}
                      onCheckedChange={(checked) => setMapOptions({...mapOptions, includeSubdomains: !!checked})}
                    />
                    <Label htmlFor="include-subdomains">서브도메인 포함</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="map-limit">링크 제한</Label>
                  <Input
                    id="map-limit"
                    type="number"
                    value={mapOptions.limit}
                    onChange={(e) => setMapOptions({...mapOptions, limit: parseInt(e.target.value) || 5000})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {mapData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>발견된 링크 ({mapData.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {mapData.map((link, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {link}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  웹 검색
                </CardTitle>
                <CardDescription>
                  특정 검색어로 웹에서 관련 내용을 찾습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">검색어</label>
                  <Input
                    placeholder="공모전 2024"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "검색 중..." : "검색 시작"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  검색 옵션
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search-limit">결과 제한</Label>
                  <Input
                    id="search-limit"
                    type="number"
                    value={searchOptions.limit}
                    onChange={(e) => setSearchOptions({...searchOptions, limit: parseInt(e.target.value) || 10})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-lang">언어</Label>
                  <Input
                    id="search-lang"
                    placeholder="ko"
                    value={searchOptions.lang}
                    onChange={(e) => setSearchOptions({...searchOptions, lang: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-country">국가</Label>
                  <Input
                    id="search-country"
                    placeholder="KR"
                    value={searchOptions.country}
                    onChange={(e) => setSearchOptions({...searchOptions, country: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-filter">필터</Label>
                  <Input
                    id="search-filter"
                    placeholder="site:example.com"
                    value={searchOptions.filter}
                    onChange={(e) => setSearchOptions({...searchOptions, filter: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>검색 결과 ({searchResults.length}개)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-auto">
                  {searchResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{result.title || `결과 ${index + 1}`}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {result.description || result.content?.substring(0, 200) + '...'}
                      </p>
                      {result.url && (
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                          {result.url}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContestCrawler;
