import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Trophy, FileText, Lightbulb } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContests } from '@/hooks/useContests';
import AIAssistant from '@/components/AIAssistant';
import ProgressManager from '@/components/ProgressManager';
import FileManager from '@/components/FileManager';

const ContestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getContestById, updateContest } = useContests();

  const contest = id ? getContestById(id) : null;

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">공모전을 찾을 수 없습니다</h2>
            <Button onClick={() => navigate('/')} className="mt-4">
              홈으로 돌아가기
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleProgressUpdate = (progress: number) => {
    updateContest(contest.id, { progress });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'submitted': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing': return '준비중';
      case 'in-progress': return '진행중';
      case 'submitted': return '제출완료';
      case 'completed': return '완료';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {contest.title}
              </h1>
              <p className="text-muted-foreground">{contest.organization}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contest.status)}`}>
              {getStatusText(contest.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 공모전 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-contest-orange" />
                  공모전 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">마감일</p>
                      <p className="font-medium">{contest.deadline}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">팀원</p>
                      <p className="font-medium">{contest.teamMembers}명</p>
                    </div>
                  </div>
                </div>

                {contest.category && (
                  <div>
                    <p className="text-sm text-muted-foreground">카테고리</p>
                    <p className="font-medium">{contest.category}</p>
                  </div>
                )}

                {contest.prize && (
                  <div>
                    <p className="text-sm text-muted-foreground">상금/혜택</p>
                    <p className="font-medium">{contest.prize}</p>
                  </div>
                )}

                {contest.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">설명</p>
                    <p className="text-sm">{contest.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 진행 상황 관리 */}
            <ProgressManager 
              contestId={contest.id}
              currentProgress={contest.progress}
              onProgressUpdate={handleProgressUpdate}
            />

            {/* 파일 관리 */}
            <FileManager contestId={contest.id} />

            {/* AI 어시스턴트 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-contest-coral" />
                  AI 어시스턴트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIAssistant />
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 진행률 요약 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">진행률 요약</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>전체 진행률</span>
                    <span>{contest.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-contest-gradient h-2 rounded-full transition-all duration-300"
                      style={{ width: `${contest.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    D-{contest.daysLeft > 0 ? contest.daysLeft : '마감'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 빠른 작업 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  상태 변경
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  팀원 관리
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  일정 추가
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContestDetail;
