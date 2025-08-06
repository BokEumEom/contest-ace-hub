import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CrawlService } from '@/services/crawlService';
import { useContests } from '@/hooks/useContests';
import { GeminiService } from '@/services/geminiService';
import { CrawledContest, CrawlOptions, ScrapeOptions, MapOptions, SearchOptions } from '../types';
import { DEFAULT_CRAWL_OPTIONS, DEFAULT_SCRAPE_OPTIONS, DEFAULT_MAP_OPTIONS, DEFAULT_SEARCH_OPTIONS } from '../constants';
import { convertToContestRegistrationData, filterContestsByKeywords } from '../utils';

export const useContestCrawler = () => {
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contests, setContests] = useState<CrawledContest[]>([]);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [mapData, setMapData] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // Options state
  const [crawlOptions, setCrawlOptions] = useState<CrawlOptions>(DEFAULT_CRAWL_OPTIONS);
  const [scrapeOptions, setScrapeOptions] = useState<ScrapeOptions>(DEFAULT_SCRAPE_OPTIONS);
  const [mapOptions, setMapOptions] = useState<MapOptions>(DEFAULT_MAP_OPTIONS);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(DEFAULT_SEARCH_OPTIONS);
  
  const { addContest } = useContests();
  const { toast } = useToast();

  // API 키 로드
  useEffect(() => {
    const loadApiKey = async () => {
      const key = await CrawlService.getApiKey();
      setApiKey(key);
    };
    loadApiKey();
  }, []);

  // 크롤링된 공모전을 실제 공모전으로 등록하는 함수
  const handleRegisterContest = async (crawledContest: CrawledContest) => {
    try {
      const contestData = convertToContestRegistrationData(crawledContest);
      await addContest(contestData);

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

  // AI를 활용한 스크래핑된 데이터에서 공모전 정보를 추출하여 등록하는 함수
  const handleRegisterFromScrapedDataWithAI = async () => {
    if (!scrapedData) return;

    try {
      setIsLoading(true);
      
      const geminiApiKey = await GeminiService.getApiKey();
      if (!geminiApiKey) {
        toast({
          title: "AI 기능 사용 불가",
          description: "AI 기능을 사용하려면 설정에서 Gemini API 키를 설정해주세요.",
          variant: "destructive"
        });
        return;
      }

      const gemini = new GeminiService(geminiApiKey);
      const markdown = scrapedData.markdown || '';
      
      const contestInfo = await gemini.extractContestInfoFromUrl(url, markdown);
      const contestData = convertToContestRegistrationData({
        title: contestInfo.title,
        organization: contestInfo.organization,
        deadline: contestInfo.deadline,
        category: contestInfo.category,
        prize: contestInfo.prize,
        description: contestInfo.description,
        url: contestInfo.contestUrl
      });

      await addContest(contestData);

      toast({
        title: "AI 등록 성공",
        description: `"${contestInfo.title}" 공모전이 AI 분석을 통해 등록되었습니다.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error registering contest with AI:', error);
      toast({
        title: "오류",
        description: "AI 기반 공모전 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 크롤링 핸들러
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
        const filteredContests = filterContestsByKeywords(result.contests, keywords);
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

  // 스크래핑 핸들러
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

  // 매핑 핸들러
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

  // 검색 핸들러
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

  return {
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
  };
}; 