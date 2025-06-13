
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CrawlService } from '@/services/crawlService';
import { Globe, Loader2, Calendar, Trophy, Star, Filter } from 'lucide-react';

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
  const [keywords, setKeywords] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crawledContests, setCrawledContests] = useState<CrawledContest[]>([]);
  const [filteredContests, setFilteredContests] = useState<CrawledContest[]>([]);
  const { toast } = useToast();

  const handleCrawl = async () => {
    if (!url.trim()) {
      toast({
        title: "오류",
        description: "크롤링할 URL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setCrawling(true);
    setProgress(0);
    setCrawledContests([]);
    setFilteredContests([]);

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result = await CrawlService.crawlContestSite(url);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.contests) {
        setCrawledContests(result.contests);
        applyKeywordFilter(result.contests, keywords);
        toast({
          title: "성공",
          description: `${result.contests.length}개의 공모전을 찾았습니다.`
        });
      } else {
        toast({
          title: "오류",
          description: result.error || "크롤링에 실패했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "크롤링 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setCrawling(false);
    }
  };

  const applyKeywordFilter = (contests: CrawledContest[], filterKeywords: string) => {
    if (!filterKeywords.trim()) {
      setFilteredContests(contests);
      return;
    }

    const keywordList = filterKeywords.toLowerCase().split(',').map(k => k.trim());
    const filtered = contests.filter(contest => {
      const searchText = `${contest.title} ${contest.description} ${contest.category} ${contest.organization}`.toLowerCase();
      return keywordList.some(keyword => searchText.includes(keyword));
    });

    setFilteredContests(filtered);
  };

  const handleKeywordFilter = () => {
    applyKeywordFilter(crawledContests, keywords);
    toast({
      title: "필터 적용됨",
      description: `${filteredContests.length}개의 공모전이 필터링되었습니다.`
    });
  };

  const addToMyContests = (contest: CrawledContest) => {
    // 여기서 실제로는 useContests 훅을 사용하여 공모전을 추가할 수 있습니다
    toast({
      title: "추가됨",
      description: `"${contest.title}"이(가) 내 공모전에 추가되었습니다.`
    });
  };

  const displayContests = keywords.trim() ? filteredContests : crawledContests;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-contest-blue" />
            웹사이트 크롤링
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">크롤링할 URL</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleCrawl}
                  disabled={crawling}
                  className="contest-button-primary"
                >
                  {crawling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  {crawling ? "크롤링 중..." : "크롤링 시작"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                공모전 정보가 포함된 웹사이트 URL을 입력하세요.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">키워드 필터 (선택사항)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="IT, 디자인, 창업 (쉼표로 구분)"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleKeywordFilter}
                  variant="outline"
                  disabled={crawledContests.length === 0}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  필터 적용
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                관심 있는 키워드로 공모전을 필터링하세요.
              </p>
            </div>
          </div>

          {crawling && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>크롤링 진행률</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 크롤링 결과 */}
      {displayContests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {keywords.trim() ? '필터링된 ' : ''}크롤링 결과 ({displayContests.length}개)
            </h3>
            {keywords.trim() && crawledContests.length > 0 && (
              <p className="text-sm text-muted-foreground">
                전체 {crawledContests.length}개 중 {displayContests.length}개 표시
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayContests.map((contest, index) => (
              <Card key={index} className="contest-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-2 mb-2">
                        {contest.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{contest.organization}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-contest-orange">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {contest.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">{contest.category}</Badge>
                    {contest.prize && (
                      <span className="font-medium text-contest-orange">{contest.prize}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{contest.deadline}</span>
                      {contest.daysLeft !== undefined && (
                        <span className="text-contest-coral">D-{contest.daysLeft}</span>
                      )}
                    </div>
                    {contest.participants && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span>{contest.participants}명</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addToMyContests(contest)}
                      className="flex-1 contest-button-primary"
                      size="sm"
                    >
                      내 공모전에 추가
                    </Button>
                    <Button
                      onClick={() => window.open(contest.url, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      원본 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {displayContests.length === 0 && !crawling && crawledContests.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            크롤링 결과가 없습니다
          </h3>
          <p className="text-muted-foreground">
            공모전 정보가 포함된 웹사이트를 크롤링해보세요.
          </p>
        </div>
      )}

      {displayContests.length === 0 && !crawling && crawledContests.length > 0 && keywords.trim() && (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            필터 조건에 맞는 공모전이 없습니다
          </h3>
          <p className="text-muted-foreground">
            다른 키워드로 필터링하거나 전체 결과를 확인해보세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContestCrawler;
