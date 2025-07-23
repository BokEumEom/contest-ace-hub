
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import ContestCard from '@/components/ContestCard';
import { useContests } from '@/hooks/useContests';
import { Trophy, Plus, Users, User, Clock, CheckCircle, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileContestList from '@/components/mobile/MobileContestList';
import { Contest } from '@/services/contestService';

type FilterType = 'all' | 'active' | 'expired';

const Contests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { contests, myContests, loading } = useContests();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const isMobile = useIsMobile();

  // URL 파라미터에서 탭 설정 읽기
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my' && user) {
      setActiveTab('my');
    }
  }, [searchParams, user]);

  // 현재 탭의 공모전 목록
  const currentContests = activeTab === 'all' ? contests : myContests;
  const isMyContests = activeTab === 'my';

  // 공모전 필터링 (메모이제이션)
  const filteredContests = useMemo(() => {
    if (!currentContests.length) return { active: [], expired: [] };

    const now = new Date();
    
    return currentContests.reduce((acc, contest) => {
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
  }, [currentContests]);

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

  // 모바일에서는 모바일 전용 컴포넌트 사용
  if (isMobile) {
    return <MobileContestList />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              공모전 목록
            </h2>
            <p className="text-muted-foreground">
              {activeTab === 'all' ? '모든 공모전을 탐색하세요.' : '내가 올린 공모전을 관리하세요.'}
            </p>
          </div>
          {user && (
            <Button 
              onClick={() => navigate('/new-contest')}
              className="contest-button-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 공모전 등록
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-contest-orange mx-auto mb-4"></div>
            <p className="text-muted-foreground">공모전 정보를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 탭 네비게이션 - 개선된 디자인 */}
            <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
              <div className="flex">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'ghost'}
                  size="lg"
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 flex items-center justify-center space-x-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'all' 
                      ? 'bg-contest-gradient text-white shadow-md' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">전체 공모전</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                    {contests.length}
                  </span>
                </Button>
                {user && (
                  <Button
                    variant={activeTab === 'my' ? 'default' : 'ghost'}
                    size="lg"
                    onClick={() => setActiveTab('my')}
                    className={`flex-1 flex items-center justify-center space-x-2 rounded-lg transition-all duration-200 ${
                      activeTab === 'my' 
                        ? 'bg-contest-gradient text-white shadow-md' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">내가 올린 공모전</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium">
                      {myContests.length}
                    </span>
                  </Button>
                )}
              </div>
            </div>

            {/* 필터 섹션 - 개선된 디자인 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeTab === 'all' ? '전체 공모전' : '내가 올린 공모전'} 필터
                  </h3>
                </div>
                <div className="text-sm text-gray-500">
                  총 {currentContests.length}개의 공모전
                </div>
              </div>
              
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {filterButtons.map((filter) => (
                  <Button
                    key={filter.key}
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex items-center gap-2 transition-all duration-200 min-w-fit ${
                      activeFilter === filter.key
                        ? 'bg-contest-gradient text-white border-contest-orange hover:bg-contest-coral shadow-md'
                        : filter.className
                    }`}
                  >
                    <filter.icon className="h-4 w-4" />
                    <span className="font-medium">{filter.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeFilter === filter.key 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {filter.count}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 공모전 목록 섹션 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              {currentContests.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {isMyContests ? '등록된 공모전이 없습니다' : '공모전이 없습니다'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {isMyContests 
                      ? '새로운 공모전을 등록하여 체계적으로 관리해보세요.'
                      : '아직 등록된 공모전이 없습니다. 첫 번째 공모전을 등록해보세요!'
                    }
                  </p>
                  {user && (
                    <Button
                      onClick={() => navigate('/new-contest')}
                      className="contest-button-primary px-6 py-3"
                    >
                      {isMyContests ? '첫 번째 공모전 등록하기' : '공모전 등록하기'}
                    </Button>
                  )}
                  {!user && (
                    <Button
                      onClick={() => navigate('/auth')}
                      className="contest-button-primary px-6 py-3"
                    >
                      로그인하여 공모전 등록하기
                    </Button>
                  )}
                </div>
              ) : displayContests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    {activeFilter === 'expired' ? (
                      <CheckCircle className="h-16 w-16 text-gray-400 mx-auto" />
                    ) : (
                      <Clock className="h-16 w-16 text-gray-400 mx-auto" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {activeFilter === 'expired' 
                      ? '마감된 공모전이 없습니다' 
                      : '진행중인 공모전이 없습니다'
                    }
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {activeFilter === 'expired' 
                      ? '아직 마감된 공모전이 없어요.' 
                      : '새로운 공모전을 등록해보세요!'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayContests.map((contest, index) => (
                    <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <ContestCard 
                        {...contest} 
                        onClick={() => navigate(`/contest/${contest.id}`)}
                        showOwner={activeTab === 'all'} // 전체 공모전에서는 작성자 표시
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Contests;
