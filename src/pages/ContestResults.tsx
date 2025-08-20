import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContestHeader } from '@/components/contest/ContestHeader';
import { ContestResults } from '@/components/contest/ContestResults';
import { ContestResultForm } from '@/components/contest/ContestResultForm';
import { useContestResults } from '@/hooks/useContestResults';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Trophy, 
  Medal, 
  Award, 
  FileText,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { ContestResultFormData } from '@/types/contest';
import { useAuth } from '@/components/AuthProvider';

const ContestResultsPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const {
    results,
    stats,
    isLoading,
    error,
    addResult,
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
    user_id: 'temp-user-id', // 임시 사용자 ID
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
      case 'winner': return 'bg-yellow-100 text-yellow-800';
      case 'runner_up': return 'bg-gray-100 text-gray-800';
      case 'shortlisted': return 'bg-orange-100 text-orange-800';
      case 'honorable_mention': return 'bg-blue-100 text-blue-800';
      case 'participant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'winner': return '우승';
      case 'runner_up': return '준우승';
      case 'shortlisted': return '최종 후보';
      case 'honorable_mention': return '특별상';
      case 'participant': return '참가';
      default: return status;
    }
  };

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 7) return 'text-red-600 bg-red-50';
    if (daysLeft <= 30) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  // 결과 추가 핸들러
  const handleAddResult = async (resultData: ContestResultFormData) => {
    try {
      const success = await addResult(resultData);
      if (success) {
        setShowAddForm(false);
        // 성공 메시지 표시
        alert('결과가 성공적으로 추가되었습니다.');
      }
    } catch (error) {
      console.error('Error adding result:', error);
      alert('결과 추가 중 오류가 발생했습니다.');
    }
  };

  // 공모전 소유자 여부 확인 (실제로는 API에서 확인해야 함)
  const isContestOwner = user?.id === contest.user_id;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
            <div className="flex items-center gap-3">
              {isContestOwner && (
                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      결과 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>공모전 결과 추가</DialogTitle>
                    </DialogHeader>
                    <ContestResultForm
                      contestId={parseInt(contestId || '1')}
                      onSubmit={handleAddResult}
                      onCancel={() => setShowAddForm(false)}
                      isLoading={isLoading}
                    />
                  </DialogContent>
                </Dialog>
              )}
              <Button onClick={refetch} variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>
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
            <Medal className="h-6 w-6 text-orange-600" />
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
            <Award className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">내 결과</h2>
          </div>
          
          {user ? (
            getMyResult() ? (
              <ContestResults
                results={[getMyResult()!]}
                stats={stats}
                isLoading={isLoading}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">
                  아직 결과가 발표되지 않았습니다
                </h4>
                <p className="text-muted-foreground">
                  공모전 결과 발표를 기다려주세요.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">
                로그인이 필요합니다
              </h4>
              <p className="text-muted-foreground">
                내 결과를 확인하려면 로그인해주세요.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContestResultsPage; 