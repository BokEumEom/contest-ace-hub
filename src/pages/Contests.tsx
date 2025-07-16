
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import ContestCard from '@/components/ContestCard';
import { useContests } from '@/hooks/useContests';
import { Trophy, Plus, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileContestList from '@/components/mobile/MobileContestList';

const Contests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { contests, myContests, loading } = useContests();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const isMobile = useIsMobile();

  // URL 파라미터에서 탭 설정 읽기
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my' && user) {
      setActiveTab('my');
    }
  }, [searchParams, user]);

  // 모바일에서는 모바일 전용 컴포넌트 사용
  if (isMobile) {
    return <MobileContestList />;
  }

  const currentContests = activeTab === 'all' ? contests : myContests;
  const isMyContests = activeTab === 'my';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              공모전 목록
            </h2>
            <p className="text-muted-foreground">
              {activeTab === 'all' ? '공모전을 확인하세요.' : '내가 올린 공모전을 관리하세요.'}
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

        {/* 탭 네비게이션 */}
        {user && (
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>전체 공모전</span>
            </Button>
            <Button
              variant={activeTab === 'my' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('my')}
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>내가 올린 공모전</span>
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-contest-orange mx-auto mb-4"></div>
            <p className="text-muted-foreground">공모전 정보를 불러오는 중...</p>
          </div>
        ) : currentContests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentContests.map((contest, index) => (
              <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ContestCard 
                  {...contest} 
                  onClick={() => navigate(`/contest/${contest.id}`)}
                  showOwner={activeTab === 'all'} // 전체 공모전에서는 작성자 표시
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Contests;
