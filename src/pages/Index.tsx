
import React from 'react';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import ContestCard from '@/components/ContestCard';
import QuickActions from '@/components/QuickActions';

const Index = () => {
  // Sample data
  const stats = [
    { title: '진행중인 공모전', value: '5', icon: Calendar, color: 'orange' as const, trend: { value: '+2 이번 달', isPositive: true } },
    { title: '제출 완료', value: '12', icon: Trophy, color: 'blue' as const, trend: { value: '+3 지난 달', isPositive: true } },
    { title: '팀 프로젝트', value: '3', icon: Users, color: 'coral' as const },
    { title: '임박한 마감', value: '2', icon: Clock, color: 'light-blue' as const, trend: { value: '이번 주', isPositive: false } }
  ];

  const contests = [
    {
      title: '2024 스마트시티 아이디어 공모전',
      organization: '과학기술정보통신부',
      deadline: '2024.07.15',
      category: 'IT/기술',
      prize: '대상 500만원',
      status: 'in-progress' as const,
      daysLeft: 5,
      progress: 75,
      teamMembers: 4
    },
    {
      title: '청년 창업 아이디어 경진대회',
      organization: '중소벤처기업부',
      deadline: '2024.07.20',
      category: '창업/비즈니스',
      prize: '최우수상 1000만원',
      status: 'preparing' as const,
      daysLeft: 10,
      progress: 45,
      teamMembers: 3
    },
    {
      title: '디지털 헬스케어 해커톤',
      organization: '보건복지부',
      deadline: '2024.06.30',
      category: '헬스케어',
      prize: '대상 300만원',
      status: 'submitted' as const,
      daysLeft: 0,
      progress: 100,
      teamMembers: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            안녕하세요, 김철수님! 👋
          </h2>
          <p className="text-muted-foreground">
            오늘도 멋진 공모전 도전을 응원합니다. 현재 진행 상황을 확인해보세요.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">빠른 작업</h3>
          <QuickActions />
        </div>

        {/* Active Contests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">진행중인 공모전</h3>
            <button className="text-contest-orange font-medium hover:text-contest-coral transition-colors">
              전체 보기 →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ContestCard {...contest} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="contest-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">최근 활동</h3>
          <div className="space-y-4">
            {[
              { action: '파일 업로드', detail: '기획서_v2.pdf', time: '2시간 전', type: 'upload' },
              { action: '체크리스트 완료', detail: '시장조사 자료 수집', time: '5시간 전', type: 'check' },
              { action: '팀원 추가', detail: '이영희님이 팀에 참여했습니다', time: '1일 전', type: 'team' },
              { action: '마감일 알림', detail: '스마트시티 공모전 D-5', time: '1일 전', type: 'deadline' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 py-2">
                <div className="h-2 w-2 bg-contest-orange rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
