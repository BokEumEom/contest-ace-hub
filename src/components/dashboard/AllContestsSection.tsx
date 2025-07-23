import React, { useState, useMemo } from 'react';
import { Calendar, Trophy, Filter, Clock, CheckCircle } from 'lucide-react';
import ContestCard from '@/components/ContestCard';
import { Button } from '@/components/ui/button';
import { Contest } from '@/services/contestService';

interface AllContestsSectionProps {
  contests: Contest[];
  loading: boolean;
  user: any;
  onContestClick: (contestId: string | number) => void;
  onViewAllClick: () => void;
  onNewContestClick: () => void;
  onAuthClick: () => void;
}

type FilterType = 'all' | 'active' | 'expired';

const AllContestsSection: React.FC<AllContestsSectionProps> = ({
  contests,
  loading,
  user,
  onContestClick,
  onViewAllClick,
  onNewContestClick,
  onAuthClick
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  // 공모전 필터링 (메모이제이션)
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

  return (
    <div className="mb-8">
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-contest-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">공모전 정보를 불러오는 중...</p>
        </div>
      ) : !user ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">
            로그인이 필요합니다
          </h4>
          <p className="text-muted-foreground mb-6">
            공모전 정보를 보려면 먼저 로그인해주세요.
          </p>
          <Button
            onClick={onAuthClick}
            className="contest-button-primary px-6 py-3 rounded-lg font-medium"
          >
            로그인하기
          </Button>
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
          <Button
            onClick={onNewContestClick}
            className="contest-button-primary px-6 py-3 rounded-lg font-medium"
          >
            공모전 등록하기
          </Button>
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
                    onClick={() => onContestClick(contest.id)}
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
                onClick={onViewAllClick}
                className="px-6 py-2"
              >
                더 많은 공모전 보기 ({displayContests.length}개)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllContestsSection; 