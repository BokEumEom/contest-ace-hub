import React, { useState, useCallback } from 'react';
import { Calendar, Users, AlertTriangle, ChevronRight, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSwipe } from '@/hooks/use-swipe';

interface MobileContestCardProps {
  title: string;
  organization?: string;
  deadline?: string;
  category?: string;
  status?: 'preparing' | 'in-progress' | 'submitted' | 'completed';
  progress?: number;
  team_members_count?: number;
  contest_theme?: string;
  days_left?: number;
  onClick?: () => void;
  onQuickAction?: (action: 'edit' | 'share' | 'delete') => void;
}

const MobileContestCard: React.FC<MobileContestCardProps> = ({
  title,
  organization,
  deadline,
  category,
  status = 'preparing',
  progress = 0,
  team_members_count = 0,
  contest_theme,
  days_left = 0,
  onClick,
  onQuickAction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // 스와이프 제스처 설정
  useSwipe(cardRef, {
    onSwipeLeft: () => setShowActions(true),
    onSwipeRight: () => setShowActions(false),
  }, { minSwipeDistance: 30 });

  const statusConfig = {
    preparing: { label: '준비중', color: 'bg-blue-100 text-blue-700' },
    'in-progress': { label: '진행중', color: 'bg-yellow-100 text-yellow-700' },
    submitted: { label: '제출완료', color: 'bg-green-100 text-green-700' },
    completed: { label: '완료', color: 'bg-gray-100 text-gray-700' }
  };

  const urgencyLevel = days_left <= 3 ? 'urgent' : days_left <= 7 ? 'warning' : 'normal';

  const handleCardPress = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const handleLongPress = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleQuickAction = useCallback((action: 'edit' | 'share' | 'delete') => {
    setShowActions(false);
    onQuickAction?.(action);
  }, [onQuickAction]);

  return (
    <div className="relative">
      {/* 메인 카드 */}
      <div
        ref={cardRef}
        className={`
          relative bg-white rounded-xl shadow-sm border border-gray-200
          transition-all duration-300 ease-out
          ${showActions ? 'transform -translate-x-20' : ''}
          ${isExpanded ? 'h-auto' : 'h-24'}
          touch-feedback
        `}
        onClick={handleCardPress}
        onTouchStart={() => {
          // 롱프레스 감지
          const timer = setTimeout(() => {
            handleLongPress();
          }, 500);
          
          const cleanup = () => {
            clearTimeout(timer);
            document.removeEventListener('touchend', cleanup);
          };
          
          document.addEventListener('touchend', cleanup);
        }}
      >
        {/* 상단 정보 */}
        <div className="flex items-center justify-between p-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`text-xs ${statusConfig[status].color}`}>
                {statusConfig[status].label}
              </Badge>
              {urgencyLevel === 'urgent' && (
                <AlertTriangle className="h-3 w-3 text-red-500" />
              )}
            </div>
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {title}
            </h3>
            {organization && (
              <p className="text-xs text-gray-500 truncate">{organization}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className={`
              text-xs font-bold px-2 py-1 rounded-full
              ${urgencyLevel === 'urgent' ? 'bg-red-100 text-red-700' : 
                urgencyLevel === 'warning' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-green-100 text-green-700'}
            `}>
              {days_left > 0 ? `D-${days_left}` : '마감'}
            </div>
            <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* 확장된 정보 */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
            {/* 진행률 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">진행률</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-contest-gradient h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="h-3 w-3" />
                <span>{team_members_count}명</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{deadline || '미정'}</span>
              </div>
            </div>

            {/* 공모주제 */}
            {contest_theme && (
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-xs text-purple-600 font-medium mb-1">공모주제</p>
                <p className="text-xs text-purple-700 line-clamp-2">{contest_theme}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 퀵 액션 버튼들 */}
      {showActions && (
        <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => handleQuickAction('edit')}
          >
            <Target className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => handleQuickAction('share')}
          >
            <Clock className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileContestCard; 