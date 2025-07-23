
import React, { useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import MobileHeader from '@/components/mobile/MobileHeader';
import QuickActions from '@/components/QuickActions';
import { useContests } from '@/hooks/useContests';
import { useAuth } from '@/components/AuthProvider';
import { useDashboardUtils } from '@/hooks/useDashboardUtils';
import { useIsMobile } from '@/hooks/use-mobile';

// Import refactored components
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StatsGrid from '@/components/dashboard/StatsGrid';
import UrgentContestsSection from '@/components/dashboard/UrgentContestsSection';
import AllContestsSection from '@/components/dashboard/AllContestsSection';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import { ArrowRight, Clock, CheckCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContestCard from '@/components/ContestCard';
import { Contest } from '@/services/contestService';

type FilterType = 'all' | 'active' | 'expired';

// 메모이제이션된 랜딩 페이지 컴포넌트
const LandingPage = React.memo(() => {
  const navigate = useNavigate();

  const handleGetStarted = useCallback(() => navigate('/auth'), [navigate]);
  const handleLogin = useCallback(() => navigate('/auth'), [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      <HeroSection onGetStarted={handleGetStarted} onLogin={handleLogin} />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection onGetStarted={handleGetStarted} onLogin={handleLogin} />
    </div>
  );
});

// 메모이제이션된 대시보드 컴포넌트
const Dashboard = React.memo(() => {
  const navigate = useNavigate();
  const { contests, myContests, loading } = useContests();
  const { user } = useAuth();
  const { calculateStats, getUrgentContests } = useDashboardUtils();
  const isMobile = useIsMobile();
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  // 통계 계산 (메모이제이션) - 개인 공모전 기준
  const stats = React.useMemo(() => {
    return calculateStats(myContests, loading, user);
  }, [myContests, loading, user, calculateStats]);

  // 임박한 마감 공모전 (메모이제이션) - 개인 공모전 기준
  const urgentContests = React.useMemo(() => {
    return getUrgentContests(myContests, loading, user);
  }, [myContests, loading, user, getUrgentContests]);

  // 전체 공모전 필터링 (메모이제이션)
  const filteredContests = useMemo(() => {
    if (!contests.length) return { active: [], expired: [] };

    const now = new Date();
    
    return contests.reduce((acc, contest) => {
      if (!contest.deadline) {
        acc.active.push(contest);
        return acc;
      }

      const deadlineDate = new Date(contest.deadline);
      const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft > 0) {
        acc.active.push(contest);
      } else {
        acc.expired.push(contest);
      }

      return acc;
    }, { active: [] as Contest[], expired: [] as Contest[] });
  }, [contests]);

  // 현재 필터에 따른 표시할 공모전
  const displayContests = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return filteredContests.active;
      case 'expired':
        return filteredContests.expired;
      case 'all':
        return [...filteredContests.active, ...filteredContests.expired];
      default:
        return filteredContests.active;
    }
  }, [activeFilter, filteredContests]);

  // 필터 버튼들
  const filterButtons = [
    {
      key: 'active' as FilterType,
      label: '진행중',
      count: filteredContests.active.length,
      icon: Clock,
      className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
    },
    {
      key: 'expired' as FilterType,
      label: '마감됨',
      count: filteredContests.expired.length,
      icon: CheckCircle,
      className: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
    },
    {
      key: 'all' as FilterType,
      label: '전체',
      count: filteredContests.active.length + filteredContests.expired.length,
      icon: Filter,
      className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    }
  ];

  // 네비게이션 핸들러 (메모이제이션)
  const handleContestClick = useCallback((contestId: string | number) => {
    navigate(`/contest/${contestId}`);
  }, [navigate]);

  const handleViewAllClick = useCallback(() => {
    navigate('/contests');
  }, [navigate]);

  const handleNewContestClick = useCallback(() => {
    navigate('/new-contest');
  }, [navigate]);

  const handleAuthClick = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  // 모바일에서는 모바일 전용 대시보드 사용
  if (isMobile) {
    return <MobileDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <WelcomeSection />

        {/* Hero Section + Stats */}
        <div className="mb-8">
          <StatsGrid
            stats={stats}
            loading={loading}
            user={user}
            onAuthClick={handleAuthClick}
          />
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <QuickActions />
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* 개인 공모전 섹션 */}
          {user && (
            <section className="space-y-6">
              <UrgentContestsSection
                urgentContests={urgentContests}
                onContestClick={handleContestClick}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">내가 올린 공모전</h3>
                  {myContests.length > 0 && (
                    <button 
                      onClick={() => navigate('/contests?tab=my')}
                      className="text-contest-orange font-medium hover:text-contest-coral transition-colors flex items-center gap-1"
                    >
                      전체 보기
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <AllContestsSection
                  contests={myContests}
                  loading={loading}
                  user={user}
                  onContestClick={handleContestClick}
                  onViewAllClick={handleViewAllClick}
                  onNewContestClick={handleNewContestClick}
                  onAuthClick={handleAuthClick}
                />
              </div>
            </section>
          )}

          {/* 전체 공모전 섹션 */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">전체 공모전</h3>
              <button 
                onClick={() => navigate('/contests')}
                className="text-contest-orange font-medium hover:text-contest-coral transition-colors flex items-center gap-1"
              >
                전체 보기
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* 필터링이 적용된 전체 공모전 섹션 */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-contest-orange mx-auto mb-4"></div>
                <p className="text-muted-foreground">공모전 정보를 불러오는 중...</p>
              </div>
            ) : !user ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 text-muted-foreground mx-auto mb-4">📊</div>
                <h4 className="text-lg font-medium text-foreground mb-2">
                  로그인이 필요합니다
                </h4>
                <p className="text-muted-foreground mb-6">
                  공모전 정보를 보려면 먼저 로그인해주세요.
                </p>
                <Button
                  onClick={handleAuthClick}
                  className="contest-button-primary px-6 py-3 rounded-lg font-medium"
                >
                  로그인하기
                </Button>
              </div>
            ) : contests.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 text-muted-foreground mx-auto mb-4">🏆</div>
                <h4 className="text-lg font-medium text-foreground mb-2">
                  아직 등록된 공모전이 없습니다
                </h4>
                <p className="text-muted-foreground">
                  첫 번째 공모전을 등록해보세요!
                </p>
              </div>
            ) : (
              <div>
                {/* 필터 버튼들 */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                  {filterButtons.map((filter) => (
                    <Button
                      key={filter.key}
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`flex items-center gap-2 transition-all duration-200 ${
                        activeFilter === filter.key
                          ? 'bg-contest-gradient text-white border-contest-orange hover:bg-contest-coral'
                          : filter.className
                      }`}
                    >
                      <filter.icon className="h-4 w-4" />
                      <span>{filter.label}</span>
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs font-medium">
                        {filter.count}
                      </span>
                    </Button>
                  ))}
                </div>

                {/* 공모전 목록 */}
                {displayContests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      {activeFilter === 'expired' ? (
                        <CheckCircle className="h-16 w-16 text-gray-400 mx-auto" />
                      ) : (
                        <Clock className="h-16 w-16 text-gray-400 mx-auto" />
                      )}
                    </div>
                    <h4 className="text-lg font-medium text-foreground mb-2">
                      {activeFilter === 'expired' 
                        ? '마감된 공모전이 없습니다' 
                        : '진행중인 공모전이 없습니다'
                      }
                    </h4>
                    <p className="text-muted-foreground">
                      {activeFilter === 'expired' 
                        ? '아직 마감된 공모전이 없어요.' 
                        : '새로운 공모전을 등록해보세요!'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayContests.slice(0, 6).map((contest, index) => (
                      <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                        <ContestCard 
                          {...contest} 
                          onClick={() => handleContestClick(contest.id)}
                          isExpired={activeFilter === 'expired' || (() => {
                            if (!contest.deadline) return false;
                            const deadlineDate = new Date(contest.deadline);
                            const now = new Date();
                            return deadlineDate.getTime() <= now.getTime();
                          })()}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 더보기 버튼 */}
                {displayContests.length > 6 && (
                  <div className="text-center mt-6">
                    <Button
                      variant="outline"
                      onClick={handleViewAllClick}
                      className="px-6 py-2"
                    >
                      더 많은 공모전 보기 ({displayContests.length}개)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
});

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // 로그아웃 상태일 때 랜딩 페이지 표시
  if (!user) {
    return <LandingPage />;
  }

  // 로그인 상태일 때 대시보드 표시
  return <Dashboard />;
};

export default Index;
