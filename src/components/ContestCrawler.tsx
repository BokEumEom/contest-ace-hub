
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CrawlService } from '@/services/crawlService';
import { useContests } from '@/hooks/useContests';
import { Search, Globe, Plus, Calendar, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  const [crawlUrl, setCrawlUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawledContests, setCrawledContests] = useState<CrawledContest[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { addContest } = useContests();

  const predefinedSites = [
    { name: '온비드', url: 'https://www.onbid.co.kr/op/kor/intro/contest.do' },
    { name: '씽굿', url: 'https://thinkgood.co.kr/contest' },
    { name: '공모전 대행', url: 'https://gonmojeon.com' }
  ];

  const handleCrawl = async (url?: string) => {
    const targetUrl = url || crawlUrl;
    
    if (!targetUrl) {
      toast({
        title: "오류",
        description: "크롤링할 사이트 URL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsCrawling(true);
    setProgress(0);
    setCrawledContests([]);

    // 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const result = await CrawlService.crawlContestSite(targetUrl);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success && result.contests) {
        setCrawledContests(result.contests);
        toast({
          title: "크롤링 완료",
          description: `${result.contests.length}개의 공모전을 찾았습니다.`
        });
      } else {
        toast({
          title: "크롤링 실패",
          description: result.error || "공모전 정보를 찾을 수 없습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      toast({
        title: "오류",
        description: "크롤링 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsCrawling(false);
    }
  };

  const handleAddContest = (crawledContest: CrawledContest) => {
    try {
      addContest({
        title: crawledContest.title,
        organization: crawledContest.organization,
        deadline: crawledContest.deadline,
        category: crawledContest.category,
        prize: crawledContest.prize,
        status: 'preparing',
        daysLeft: crawledContest.daysLeft || 0,
        progress: 0,
        teamMembers: 1,
        description: crawledContest.description
      });
      
      toast({
        title: "등록 완료",
        description: `"${crawledContest.title}" 공모전이 등록되었습니다.`
      });
    } catch (error) {
      toast({
        title: "등록 실패",
        description: "공모전 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 크롤링 입력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            공모전 사이트 크롤링
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="크롤링할 사이트 URL을 입력하세요"
              value={crawlUrl}
              onChange={(e) => setCrawlUrl(e.target.value)}
              disabled={isCrawling}
            />
            <Button
              onClick={() => handleCrawl()}
              disabled={isCrawling}
              className="contest-button-primary"
            >
              <Search className="h-4 w-4 mr-2" />
              {isCrawling ? "크롤링 중..." : "크롤링"}
            </Button>
          </div>

          {/* 추천 사이트 */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">추천 공모전 사이트:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedSites.map((site) => (
                <Button
                  key={site.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCrawl(site.url)}
                  disabled={isCrawling}
                >
                  {site.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 진행률 */}
          {isCrawling && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">크롤링 진행률</p>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 크롤링 결과 */}
      {crawledContests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            크롤링 결과 ({crawledContests.length}개)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crawledContests.map((contest, index) => (
              <Card key={index} className="contest-card">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {contest.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {contest.organization}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {contest.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">{contest.category}</Badge>
                    <span className="font-medium text-contest-orange">
                      {contest.prize}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>D-{contest.daysLeft || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>마감: {contest.deadline}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleAddContest(contest)}
                    className="w-full contest-button-primary"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    내 공모전에 추가
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestCrawler;
