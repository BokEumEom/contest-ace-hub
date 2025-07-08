
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import ContestCard from '@/components/ContestCard';
import QuickActions from '@/components/QuickActions';
import { useContests } from '@/hooks/useContests';

const Index = () => {
  const navigate = useNavigate();
  const { contests, loading } = useContests();

  // 통계 계산 (로딩 중이 아닐 때만)
  const inProgressContests = loading ? [] : contests.filter(c => c.status === 'in-progress' || c.status === 'preparing');
  const submittedContests = loading ? [] : contests.filter(c => c.status === 'submitted' || c.status === 'completed');
  const teamProjects = loading ? [] : contests.filter(c => (c.team_members_count || 0) > 1);
  const urgentContests = loading ? [] : contests.filter(c => (c.days_left || 0) <= 7 && (c.days_left || 0) > 0);

  const stats = [
    { 
      title: '진행중인 공모전', 
      value: inProgressContests.length.toString(), 
      icon: Calendar, 
      color: 'orange' as const, 
      trend: inProgressContests.length > 0 ? { value: '활발히 진행중', isPositive: true } : undefined
    },
    { 
      title: '제출 완료', 
      value: submittedContests.length.toString(), 
      icon: Trophy, 
      color: 'blue' as const,
      trend: submittedContests.length > 0 ? { value: '완료된 프로젝트', isPositive: true } : undefined
    },
    { 
      title: '팀 프로젝트', 
      value: teamProjects.length.toString(), 
      icon: Users, 
      color: 'coral' as const 
    },
    { 
      title: '임박한 마감', 
      value: urgentContests.length.toString(), 
      icon: Clock, 
      color: 'light-blue' as const, 
      trend: urgentContests.length > 0 ? { value: '주의 필요', isPositive: false } : undefined
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            안녕하세요! 👋
          </h2>
          <p className="text-muted-foreground">
            오늘도 멋진 공모전 도전을 응원합니다. 현재 진행 상황을 확인해보세요.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // 로딩 중일 때 스켈레톤 UI
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <StatsCard {...stat} />
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">빠른 작업</h3>
          <QuickActions />
        </div>

        {/* Active Contests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              {contests.length > 0 ? '내 공모전' : '등록된 공모전이 없습니다'}
            </h3>
            {contests.length > 0 && (
              <button 
                onClick={() => navigate('/contests')}
                className="text-contest-orange font-medium hover:text-contest-coral transition-colors"
              >
                전체 보기 →
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-contest-orange mx-auto mb-4"></div>
              <p className="text-muted-foreground">공모전 정보를 불러오는 중...</p>
            </div>
          ) : contests.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">
                첫 번째 공모전을 등록해보세요!
              </h4>
              <p className="text-muted-foreground mb-6">
                새로운 도전을 시작하고 체계적으로 관리해보세요.
              </p>
              <button
                onClick={() => navigate('/new-contest')}
                className="contest-button-primary px-6 py-3 rounded-lg font-medium"
              >
                공모전 등록하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.slice(0, 6).map((contest, index) => (
                <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ContestCard 
                    {...contest} 
                    onClick={() => navigate(`/contest/${contest.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity - 실제 활동이 있을 때만 표시 */}
        {!loading && contests.length > 0 && (
          <div className="contest-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">최근 활동</h3>
            <div className="space-y-4">
              {contests.slice(0, 4).map((contest, index) => (
                <div key={contest.id} className="flex items-center space-x-3 py-2">
                  <div className="h-2 w-2 bg-contest-orange rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">공모전 등록</p>
                    <p className="text-xs text-muted-foreground">{contest.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(contest.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
