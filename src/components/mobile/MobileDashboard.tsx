import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, TrendingUp, AlertTriangle, ChevronRight, Search, Bell, Users, Target, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
import { useContests } from '@/hooks/useContests';
import { useDashboardUtils } from '@/hooks/useDashboardUtils';
import MobileContestCard from './MobileContestCard';
import { useIsMobile } from '@/hooks/use-mobile';
import NavigationTransition from '@/components/NavigationTransition';

const MobileDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contests, myContests, loading } = useContests();
  const { calculateStats, getUrgentContests } = useDashboardUtils();
  const isMobile = useIsMobile();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 통계 계산
  const stats = React.useMemo(() => {
    return calculateStats(myContests, loading, user);
  }, [myContests, loading, user, calculateStats]);

  // 임박한 마감 공모전
  const urgentContests = React.useMemo(() => {
    return getUrgentContests(myContests, loading, user);
  }, [myContests, loading, user, getUrgentContests]);

  const handleContestClick = useCallback((contestId: string | number) => {
    navigate(`/contest/${contestId}`);
  }, [navigate]);

  const handleQuickAction = useCallback((contestId: string | number, action: 'edit' | 'share' | 'delete') => {
    switch (action) {
      case 'edit':
        navigate(`/contest/${contestId}`);
        break;
      case 'share':
        // 공유 기능 구현
        break;
      case 'delete':
        // 삭제 확인 다이얼로그
        break;
    }
  }, [navigate]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  if (!isMobile) return null;

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return '좋은 아침이에요';
    if (currentHour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return '사용자';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* 헤더 */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <NavigationTransition to="/" className="flex items-center space-x-2">
              <div className="bg-contest-gradient p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-contest-gradient bg-clip-text text-transparent">
                ContestHub
              </h1>
            </NavigationTransition>

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-2">
              {/* 검색 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* 알림 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 relative"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-5 w-5" />
                {/* 알림 뱃지 */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </div>

          {/* 검색바 */}
          {showSearch && (
            <div className="pb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="공모전 검색..."
                  className="pl-10 pr-4 h-12 text-base"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* 컨텐츠 영역 */}
      <div className="pb-20"> {/* 하단 네비게이션 공간 */}
        <div className="space-y-6 p-4">
          {/* 환영 메시지 */}
          <div className="bg-gradient-to-r from-contest-orange to-contest-coral rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">
                    {getGreeting()}, {getUserName()}님! 👋
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-2">
                  오늘도 공모전 준비
                  <br />
                  화이팅하세요!
                </h2>
                <p className="text-sm opacity-90">
                  체계적인 관리로 성공을 위한 모든 준비를 도와드릴게요.
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Trophy className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          {user && (
            <div className="grid grid-cols-2 gap-3">
              {stats.slice(0, 4).map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-contest-orange" />
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{stat.title}</p>
                </div>
              ))}
            </div>
          )}

          {/* 빠른 액션 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">빠른 작업</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Target className="h-4 w-4" />
                <span>핵심 기능</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate('/new-contest')}
                className="h-16 bg-contest-gradient text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                <div className="relative flex items-center justify-center">
                  <Plus className="h-5 w-5 mr-2" />
                  새 공모전
                </div>
              </Button>
              <Button
                onClick={() => navigate('/explore')}
                variant="outline"
                className="h-16 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300"
              >
                <Calendar className="h-5 w-5 mr-2" />
                탐색하기
              </Button>
            </div>
          </div>

          {/* 내 공모전 섹션 */}
          {user && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">내 공모전</h3>
                <Button
                  onClick={() => navigate('/contests?tab=my')}
                  variant="outline"
                  size="sm"
                >
                  전체 보기
                </Button>
              </div>
              
              {myContests.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-full inline-block mb-4">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    첫 번째 공모전을 등록해보세요!
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    새로운 도전을 시작하고 체계적으로 관리해보세요.
                  </p>
                  <Button
                    onClick={() => navigate('/new-contest')}
                    className="bg-contest-gradient text-white"
                  >
                    공모전 등록하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {myContests.slice(0, 3).map((contest) => (
                    <MobileContestCard
                      key={contest.id}
                      {...contest}
                      onClick={() => handleContestClick(contest.id)}
                      onQuickAction={(action) => handleQuickAction(contest.id, action)}
                    />
                  ))}
                  {myContests.length > 3 && (
                    <Button
                      onClick={() => navigate('/explore?tab=my')}
                      variant="outline"
                      className="w-full"
                    >
                      내 공모전 더보기 ({myContests.length}개)
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 임박한 마감 공모전 */}
          {urgentContests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">마감 임박</h3>
                <div className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">긴급</span>
                </div>
              </div>
              <div className="space-y-2">
                {urgentContests.slice(0, 3).map((contest) => (
                  <MobileContestCard
                    key={contest.id}
                    {...contest}
                    onClick={() => handleContestClick(contest.id)}
                    onQuickAction={(action) => handleQuickAction(contest.id, action)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 최근 활동 */}
          {user && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-contest-orange rounded-full"></div>
                    <span className="text-sm text-gray-600">새로운 공모전이 등록되었습니다</span>
                    <span className="text-xs text-gray-400 ml-auto">2시간 전</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">진행률이 업데이트되었습니다</span>
                    <span className="text-xs text-gray-400 ml-auto">1일 전</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">팀원이 추가되었습니다</span>
                    <span className="text-xs text-gray-400 ml-auto">3일 전</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 추천 공모전 */}
          {contests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">추천 공모전</h3>
                <Button
                  onClick={() => navigate('/contests')}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="h-4 w-4 mr-1" />
                  전체 보기
                </Button>
              </div>
              <div className="space-y-2">
                {contests.slice(0, 3).map((contest) => (
                  <MobileContestCard
                    key={contest.id}
                    {...contest}
                    onClick={() => handleContestClick(contest.id)}
                    onQuickAction={(action) => handleQuickAction(contest.id, action)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 하단 여백 */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard; 