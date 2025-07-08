import React from 'react';
import { Calendar, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContestCardProps {
  title: string;
  organization?: string;
  deadline?: string;
  category?: string;
  prize?: string;
  status?: 'preparing' | 'in-progress' | 'submitted' | 'completed';
  daysLeft?: number;
  days_left?: number; // Database field name
  progress?: number;
  teamMembers?: number;
  team_members_count?: number; // Database field name
  onClick?: () => void;
}

const ContestCard: React.FC<ContestCardProps> = ({
  title,
  organization,
  deadline,
  category,
  prize,
  status = 'preparing',
  daysLeft,
  days_left,
  progress = 0,
  teamMembers,
  team_members_count,
  onClick
}) => {
  const getStatusBadge = () => {
    const statusConfig = {
      preparing: { label: '준비중', className: 'bg-blue-100 text-blue-700' },
      'in-progress': { label: '진행중', className: 'bg-yellow-100 text-yellow-700' },
      submitted: { label: '제출완료', className: 'bg-green-100 text-green-700' },
      completed: { label: '완료', className: 'bg-gray-100 text-gray-700' }
    };
    return statusConfig[status] || statusConfig.preparing;
  };

  const getDeadlineClassName = () => {
    const days = daysLeft || days_left || 0;
    if (days <= 3) return 'contest-deadline-urgent';
    if (days <= 7) return 'contest-deadline-soon';
    return 'contest-deadline-normal';
  };

  return (
    <div 
      className={`contest-card p-6 animate-fade-in ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{organization}</p>
        </div>
        <Badge className={getStatusBadge().className}>
          {getStatusBadge().label}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span>마감: {deadline || '미정'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm px-2 py-1 bg-secondary rounded-md">{category || '미분류'}</span>
          <span className="text-sm font-medium text-contest-orange">{prize || '미정'}</span>
        </div>

        <div className={`contest-status-badge ${getDeadlineClassName()}`}>
          {(daysLeft || days_left || 0) > 0 ? `D-${daysLeft || days_left || 0}` : '마감'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">진행률</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-contest-gradient h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex -space-x-2 mr-2">
            {(() => {
              const memberCount = teamMembers || team_members_count || 0;
              const displayCount = Math.min(memberCount, 3);
              return [
                ...Array(displayCount).map((_, i) => (
                  <div 
                    key={i}
                    className="h-6 w-6 bg-contest-gradient rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-xs text-white">팀</span>
                  </div>
                )),
                memberCount > 3 && (
                  <div key="more" className="h-6 w-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs">+{memberCount - 3}</span>
                  </div>
                )
              ].filter(Boolean);
            })()}
          </div>
          <span>{teamMembers || team_members_count || 0}명</span>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="sm" className="contest-button-primary">
            <Check className="h-4 w-4 mr-1" />
            관리
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContestCard;
