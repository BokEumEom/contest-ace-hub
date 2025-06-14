
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ContestCard from '@/components/ContestCard';
import { useContests } from '@/hooks/useContests';
import { Trophy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Contests = () => {
  const navigate = useNavigate();
  const { contests } = useContests();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              내 공모전
            </h2>
            <p className="text-muted-foreground">
              등록된 모든 공모전을 확인하고 관리하세요.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/new-contest')}
            className="contest-button-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 공모전 등록
          </Button>
        </div>

        {contests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              등록된 공모전이 없습니다
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              새로운 공모전을 등록하여 체계적으로 관리해보세요.
            </p>
            <Button
              onClick={() => navigate('/new-contest')}
              className="contest-button-primary px-6 py-3"
            >
              첫 번째 공모전 등록하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest, index) => (
              <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ContestCard 
                  {...contest} 
                  onClick={() => navigate(`/contest/${contest.id}`)}
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
