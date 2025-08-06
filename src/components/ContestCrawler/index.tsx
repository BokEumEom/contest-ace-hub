import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Layers, Globe, MapPin, Search, Settings, Plus, Sparkles } from 'lucide-react';
import { useContestCrawler } from './hooks/useContestCrawler';
import { ApiKeyRequired } from './components/ApiKeyRequired';
import { ContestCard } from './components/ContestCard';

const ContestCrawler: React.FC = () => {
  const {
    // State
    url,
    setUrl,
    searchQuery,
    setSearchQuery,
    keywords,
    setKeywords,
    isLoading,
    contests,
    scrapedData,
    mapData,
    searchResults,
    apiKey,
    crawlOptions,
    setCrawlOptions,
    scrapeOptions,
    setScrapeOptions,
    mapOptions,
    setMapOptions,
    searchOptions,
    setSearchOptions,
    
    // Handlers
    handleRegisterContest,
    handleRegisterFromScrapedDataWithAI,
    handleCrawl,
    handleScrape,
    handleMap,
    handleSearch
  } = useContestCrawler();

  if (!apiKey) {
    return <ApiKeyRequired />;
  }

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

            {scrapedData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-contest-orange" />
                      AI 분석 결과
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRegisterFromScrapedDataWithAI}
                        disabled={isLoading}
                        className="contest-button-primary"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        AI로 등록
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    AI가 분석한 공모전 정보를 자동으로 등록합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">🤖 AI 분석 기능</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• 정확한 공모전 정보 자동 추출</li>
                        <li>• 상세한 제출 형식 및 일정 파악</li>
                        <li>• 주의사항 및 결과 발표일 자동 인식</li>
                        <li>• 카테고리 자동 분류</li>
                      </ul>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">📄 원본 데이터</h4>
                      <pre className="text-xs overflow-auto max-h-48">
                        {JSON.stringify(scrapedData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  발견된 공모전 ({contests.length}개)
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-contest-orange" />
                    AI 분석 적용됨
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contests.map((contest, index) => (
                  <ContestCard
                    key={index}
                    contest={contest}
                    onRegister={handleRegisterContest}
                  />
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