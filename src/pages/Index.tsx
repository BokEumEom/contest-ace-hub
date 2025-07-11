
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import QuickActions from '@/components/QuickActions';
import { useContests } from '@/hooks/useContests';
import { useAuth } from '@/components/AuthProvider';
import { useDashboardUtils } from '@/hooks/useDashboardUtils';

// Import refactored components
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StatsGrid from '@/components/dashboard/StatsGrid';
import UrgentContestsSection from '@/components/dashboard/UrgentContestsSection';
import AllContestsSection from '@/components/dashboard/AllContestsSection';

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

  // 통계 계산 (메모이제이션) - 개인 공모전 기준
  const stats = React.useMemo(() => {
    return calculateStats(myContests, loading, user);
  }, [myContests, loading, user, calculateStats]);

  // 임박한 마감 공모전 (메모이제이션) - 개인 공모전 기준
  const urgentContests = React.useMemo(() => {
    return getUrgentContests(myContests, loading, user);
  }, [myContests, loading, user, getUrgentContests]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection />

        <StatsGrid
          stats={stats}
          loading={loading}
          user={user}
          onAuthClick={handleAuthClick}
        />

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">빠른 작업</h3>
          <QuickActions />
        </div>

        {/* 개인 공모전 섹션 */}
        {user && (
          <>
            <UrgentContestsSection
              urgentContests={urgentContests}
              onContestClick={handleContestClick}
            />

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">내가 올린 공모전</h3>
                {myContests.length > 0 && (
                  <button 
                    onClick={() => navigate('/contests?tab=my')}
                    className="text-contest-orange font-medium hover:text-contest-coral transition-colors"
                  >
                    전체 보기 →
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
          </>
        )}

        {/* 전체 공모전 섹션 */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">전체 공모전</h3>
          <AllContestsSection
            contests={contests}
            loading={loading}
            user={user}
            onContestClick={handleContestClick}
            onViewAllClick={handleViewAllClick}
            onNewContestClick={handleNewContestClick}
            onAuthClick={handleAuthClick}
          />
        </div>
      </main>
    </div>
  );
});

const Index = () => {
  const { user } = useAuth();

  // 로그아웃 상태일 때 랜딩 페이지 표시
  if (!user) {
    return <LandingPage />;
  }

  // 로그인 상태일 때 대시보드 표시
  return <Dashboard />;
};

export default Index;
