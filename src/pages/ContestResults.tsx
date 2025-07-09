import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContestHeader } from '@/components/contest/ContestHeader';
import { ContestResults } from '@/components/contest/ContestResults';
import { useContestResults } from '@/hooks/useContestResults';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const ContestResultsPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  
  // 임시 사용자 정보 (실제로는 인증 시스템에서 가져와야 함)
  const user = { id: 'user1' };
  
  const {
    results,
    stats,
    isLoading,
    error,
    filterResultsByStatus,
    getMyResult,
    sortResultsByRank,
    refetch
  } = useContestResults({
    contestId,
    userId: user?.id
  });

  // 더미 공모전 데이터 (실제로는 API에서 가져와야 함)
  const contest = {
    id: contestId || '1',
    title: 'AI 창작 공모전',
    organization: '한국정보산업연합회',
    deadline: '2024-01-31',
    category: 'AI/기술',
    prize: '총 1000만원',
    status: 'completed' as const,
    days_left: 0,
    progress: 100,
    team_members_count: 4,
    description: 'AI 기술을 활용한 창작 도구 개발 공모전',
    contest_url: 'https://example.com/contest',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-31T23:59:59Z'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return '준비중';
      case 'in-progress':
        return '진행중';
      case 'submitted':
        return '제출완료';
      case 'completed':
        return '완료';
      default:
        return '알 수 없음';
    }
  };

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 0) return 'bg-red-100 text-red-800';
    if (daysLeft <= 7) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const myResult = getMyResult();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ContestHeader
        contest={contest}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        getDaysLeftColor={getDaysLeftColor}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">전체 결과</TabsTrigger>
          <TabsTrigger value="winners">우승자</TabsTrigger>
          <TabsTrigger value="shortlisted">최종 후보</TabsTrigger>
          <TabsTrigger value="my-result">내 결과</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">공모전 결과</h2>
            <Button onClick={refetch} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
          
          <ContestResults
            results={sortResultsByRank()}
            stats={stats}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="winners" className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <h2 className="text-2xl font-bold">우승자</h2>
          </div>
          
          <ContestResults
            results={filterResultsByStatus('winner')}
            stats={stats}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="shortlisted" className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">최종 후보</h2>
          </div>
          
          <ContestResults
            results={filterResultsByStatus('shortlisted')}
            stats={stats}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="my-result" className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">내 결과</h2>
          </div>
          
          {myResult ? (
            <ContestResults
              results={[myResult]}
              stats={stats}
              isLoading={isLoading}
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">참여 기록이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                이 공모전에 참여하지 않았거나 결과가 아직 발표되지 않았습니다.
              </p>
              <Button onClick={() => navigate(`/contest/${contestId}`)}>
                공모전 상세보기
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContestResultsPage; 