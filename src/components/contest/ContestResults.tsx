import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  Award, 
  FileText, 
  Calendar,
  Users,
  Star,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ContestResult, ContestResultStats } from '@/types/contest';

interface ContestResultsProps {
  results: ContestResult[];
  stats: ContestResultStats;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'winner':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'runner_up':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'shortlisted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'not_selected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'winner':
      return '우승';
    case 'runner_up':
      return '준우승';
    case 'shortlisted':
      return '최종 후보';
    case 'not_selected':
      return '미선정';
    default:
      return '검토중';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'winner':
      return <Trophy className="h-4 w-4" />;
    case 'runner_up':
      return <Medal className="h-4 w-4" />;
    case 'shortlisted':
      return <Award className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const ContestResults: React.FC<ContestResultsProps> = ({
  results,
  stats,
  isLoading = false
}) => {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 제출</p>
                <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">우승</p>
                <p className="text-2xl font-bold">{stats.winnerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Medal className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">준우승</p>
                <p className="text-2xl font-bold">{stats.runnerUpCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">최종 후보</p>
                <p className="text-2xl font-bold">{stats.shortlistedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 내 결과 요약 */}
      {stats.myRank && stats.myScore && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              내 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">순위</p>
                <p className="text-3xl font-bold text-primary">{stats.myRank}위</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">점수</p>
                <p className="text-3xl font-bold text-primary">{stats.myScore}점</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">평균 점수</p>
                <p className="text-3xl font-bold text-muted-foreground">
                  {stats.averageScore?.toFixed(1)}점
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 결과 목록 */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">전체 결과</h3>
        {results.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`px-3 py-1 ${getStatusColor(result.submission.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(result.submission.status)}
                          {getStatusText(result.submission.status)}
                        </div>
                      </Badge>
                      {result.rank && (
                        <Badge variant="outline">
                          {result.rank}위
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-1">
                      {result.submission.projectTitle}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.submission.teamName}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>발표일: {result.announcementDate}</span>
                      </div>
                      {result.prizeAmount && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span>상금: {result.prizeAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedResult(
                      expandedResult === result.id ? null : result.id
                    )}
                  >
                    {expandedResult === result.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* 확장된 상세 정보 */}
                {expandedResult === result.id && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">프로젝트 설명</h5>
                      <p className="text-sm text-muted-foreground">
                        {result.submission.description}
                      </p>
                    </div>

                    {result.submission.feedback && (
                      <div>
                        <h5 className="font-medium mb-2">심사 피드백</h5>
                        <p className="text-sm text-muted-foreground">
                          {result.submission.feedback}
                        </p>
                      </div>
                    )}

                    {result.submission.score && (
                      <div>
                        <h5 className="font-medium mb-2">평가 점수</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">
                            {result.submission.score}점
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${(result.submission.score / 100) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {result.certificateUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          인증서 다운로드
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        제출물 보기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 