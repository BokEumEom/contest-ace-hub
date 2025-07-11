import React from 'react';
import { Calendar, Trophy } from 'lucide-react';
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

const AllContestsSection: React.FC<AllContestsSectionProps> = ({
  contests,
  loading,
  user,
  onContestClick,
  onViewAllClick,
  onNewContestClick,
  onAuthClick
}) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.slice(0, 6).map((contest, index) => (
            <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <ContestCard 
                {...contest} 
                onClick={() => onContestClick(contest.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllContestsSection; 