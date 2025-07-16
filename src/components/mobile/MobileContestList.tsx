import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  Users, 
  User, 
  ChevronRight,
  Search,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MobileContestCard from './MobileContestCard';
import { useContests } from '@/hooks/useContests';
import { useAuth } from '@/components/AuthProvider';
import { Contest } from '@/services/contestService';

const MobileContestList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { contests, myContests, loading } = useContests();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // URL 파라미터에서 탭 설정 읽기
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my' && user) {
      setActiveTab('my');
    }
  }, [searchParams, user]);

  const currentContests = activeTab === 'all' ? contests : myContests;
  const isMyContests = activeTab === 'my';

  // 검색 필터링
  const filteredContests = currentContests.filter(contest => 
    contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contest.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContestClick = (contestId: string | number) => {
    navigate(`/contest/${contestId}`);
  };

  const handleQuickAction = (contestId: string | number, action: string) => {
    // 퀵 액션 처리
    console.log(`Quick action ${action} for contest ${contestId}`);
  };

  const handleNewContest = () => {
    navigate('/new-contest');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="mobile-contest-list">
      {/* 헤더 */}
      <div className="mobile-contest-list-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {isMyContests ? '내 공모전' : '전체 공모전'}
              </h1>
              <p className="text-xs text-gray-500">
                {filteredContests.length}개의 공모전
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="p-2"
            >
              <Search className="h-5 w-5" />
            </Button>
            {user && (
              <Button
                onClick={handleNewContest}
                size="sm"
                className="contest-button-primary"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 검색바 */}
        {showSearch && (
          <div className="mobile-contest-list-search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="공모전 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        {user && (
          <div className="mobile-contest-list-tabs">
                          <Button
                variant={activeTab === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('all')}
                className="mobile-contest-list-tab"
              >
                <Users className="h-4 w-4 mr-1" />
                전체
              </Button>
              <Button
                variant={activeTab === 'my' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('my')}
                className="mobile-contest-list-tab"
              >
                <User className="h-4 w-4 mr-1" />
                내 공모전
              </Button>
          </div>
        )}
      </div>

      {/* 컨텐츠 */}
      <div className="mobile-contest-list-content">
        {loading ? (
          <div className="mobile-contest-list-loading">
            <div className="mobile-contest-list-loading-spinner"></div>
            <p className="mobile-contest-list-loading-text">공모전 정보를 불러오는 중...</p>
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="mobile-contest-list-empty">
            <Trophy className="mobile-contest-list-empty-icon" />
            <h3 className="mobile-contest-list-empty-title">
              {searchTerm ? '검색 결과가 없습니다' : (isMyContests ? '등록된 공모전이 없습니다' : '공모전이 없습니다')}
            </h3>
            <p className="mobile-contest-list-empty-description">
              {searchTerm 
                ? '다른 검색어를 시도해보세요.'
                : (isMyContests 
                  ? '새로운 공모전을 등록하여 체계적으로 관리해보세요.'
                  : '아직 등록된 공모전이 없습니다. 첫 번째 공모전을 등록해보세요!'
                )
              }
            </p>
            {user && !searchTerm && (
              <Button
                onClick={handleNewContest}
                className="contest-button-primary px-6 py-3"
              >
                {isMyContests ? '첫 번째 공모전 등록하기' : '공모전 등록하기'}
              </Button>
            )}
            {!user && !searchTerm && (
              <Button
                onClick={() => navigate('/auth')}
                className="contest-button-primary px-6 py-3"
              >
                로그인하여 공모전 등록하기
              </Button>
            )}
          </div>
        ) : (
          <div className="mobile-contest-list-cards">
            {filteredContests.map((contest) => (
              <MobileContestCard
                key={contest.id}
                {...contest}
                onClick={() => handleContestClick(contest.id)}
                onQuickAction={(action) => handleQuickAction(contest.id, action)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileContestList; 