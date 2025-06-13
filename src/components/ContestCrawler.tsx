
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CrawlService } from '@/services/crawlService';
import { Globe, Search, MapPin, Layers, Clock, Building2, Award } from 'lucide-react';

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

const ContestCrawler: React.FC = () => {
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contests, setContests] = useState<CrawledContest[]>([]);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [mapData, setMapData] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  const apiKey = CrawlService.getApiKey();

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
      const result = await CrawlService.crawlContestSite(url, {
        limit: 30,
        scrapeOptions: {
          formats: ['markdown']
        }
      });
      
      if (result.success && result.contests) {
        let filteredContests = result.contests;
        
        // 키워드 필터링
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
      const result = await CrawlService.scrapePage(url);
      
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
      const result = await CrawlService.mapWebsite(url);
      
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
      const result = await CrawlService.searchWebsite(searchQuery);
      
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
      <Tabs defaultValue="crawl" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="crawl">크롤링</TabsTrigger>
          <TabsTrigger value="scrape">스크래핑</TabsTrigger>
          <TabsTrigger value="map">매핑</TabsTrigger>
          <TabsTrigger value="search">검색</TabsTrigger>
        </TabsList>

        <TabsContent value="crawl" className="space-y-4">
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
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(contest.url, '_blank')}
                      >
                        자세히 보기
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scrape" className="space-y-4">
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

          {scrapedData && (
            <Card>
              <CardHeader>
                <CardTitle>스크래핑 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                  {JSON.stringify(scrapedData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
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
