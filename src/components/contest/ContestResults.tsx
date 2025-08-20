import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, Users, Calendar } from 'lucide-react';
import { ContestResult } from '@/types/contest';

interface ContestStats {
  total_results: number;
  winners_count: number;
  runner_ups_count: number;
  shortlisted_count: number;
  participants_count: number;
  honorable_mentions_count: number;
  average_score: number;
}

interface ContestResultsProps {
  results: ContestResult[];
  stats: ContestStats;
  isLoading: boolean;
}

export const ContestResults: React.FC<ContestResultsProps> = ({
  results,
  stats,
  isLoading
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'awarded_1st':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'awarded_2nd':
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 'awarded_3rd':
        return <Medal className="h-6 w-6 text-amber-600" />;
      case 'special_award':
        return <Award className="h-6 w-6 text-purple-500" />;
      default:
        return <Award className="h-6 w-6 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      // 🏆 수상 그룹
      awarded_1st: { label: '🥇 1등상', className: 'bg-yellow-100 text-yellow-800' },
      awarded_2nd: { label: '🥈 2등상', className: 'bg-gray-100 text-gray-800' },
      awarded_3rd: { label: '🥉 3등상', className: 'bg-amber-100 text-amber-800' },
      special_award: { label: '🎖️ 특별상', className: 'bg-purple-100 text-purple-800' },
      
      // 📋 선정 그룹
      final_selected: { label: '🎯 최종 선정', className: 'bg-blue-100 text-blue-800' },
      excellent_work: { label: '🌟 우수작', className: 'bg-green-100 text-green-800' },
      idea_award: { label: '💡 아이디어상', className: 'bg-indigo-100 text-indigo-800' },
      
      // ✅ 진행 상태 그룹
      submitted: { label: '📝 제출 완료', className: 'bg-green-100 text-green-800' },
      under_review: { label: '🔍 심사 중', className: 'bg-yellow-100 text-yellow-800' },
      review_completed: { label: '📊 심사 완료', className: 'bg-blue-100 text-blue-800' },
      
      // ❌ 미선정 그룹
      not_selected: { label: '📋 1차 탈락', className: 'bg-red-100 text-red-800' },
      needs_revision: { label: '📝 보완 필요', className: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 참가자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.participants_count}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 팀
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total_results}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              평균 점수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.average_score.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">결과가 없습니다</h3>
              <p className="text-muted-foreground">
                아직 결과가 발표되지 않았거나 해당 조건에 맞는 결과가 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <Card key={result.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="text-lg font-semibold">
                        {result.status.includes('awarded') ? '🏆' : 
                         result.status.includes('selected') ? '📋' : 
                         result.status.includes('progress') ? '✅' : '❌'}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">{result.project_title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {result.team_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {result.prize_amount || '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">상금</div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(result.status)}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(result.announcement_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {result.description && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>프로젝트 설명:</strong> {result.description}
                    </p>
                  </div>
                )}
                
                {result.feedback && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>심사 피드백:</strong> {result.feedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}; 
