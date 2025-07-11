import React from 'react';
import { Calendar } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { Button } from '@/components/ui/button';

interface StatsGridProps {
  stats: Array<{
    title: string;
    value: string;
    icon: LucideIcon;
    color: 'orange' | 'blue' | 'coral' | 'light-blue';
    trend?: {
      value: string;
      isPositive: boolean;
    };
  }>;
  loading: boolean;
  user: any;
  onAuthClick: () => void;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, loading, user, onAuthClick }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="col-span-full text-center py-8 mb-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h4 className="text-lg font-medium text-foreground mb-2">
          로그인하여 통계를 확인하세요
        </h4>
        <p className="text-muted-foreground mb-4">
          공모전 통계와 진행 상황을 보려면 로그인이 필요합니다.
        </p>
        <Button
          onClick={onAuthClick}
          className="contest-button-primary px-6 py-3 rounded-lg font-medium"
        >
          로그인하기
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
          <StatsCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default StatsGrid; 