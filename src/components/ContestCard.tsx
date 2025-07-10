import React, { useMemo, useCallback } from 'react';
import { Calendar, Target, Users, Clock, ArrowRight, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
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
  submission_format?: string;
  contest_theme?: string;
  updated_at?: string;
  onClick?: () => void;
}

const ContestCard: React.FC<ContestCardProps> = React.memo(({
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
  submission_format,
  contest_theme,
  updated_at,
  onClick
}) => {
  // 실시간으로 D-day 계산 (메모이제이션)
  const calculateDaysLeft = useCallback(() => {
    if (!deadline) return 0;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, [deadline]);

  // 실시간 계산된 D-day 사용 (더 정확함) - 메모이제이션
  const displayDaysLeft = useMemo(() => {
    const realTimeDaysLeft = calculateDaysLeft();
    return realTimeDaysLeft > 0 ? realTimeDaysLeft : 0;
  }, [calculateDaysLeft]);

  // 상태 배지 정보 (메모이제이션)
  const statusBadge = useMemo(() => {
    const statusConfig = {
      preparing: { label: '준비중', className: 'bg-blue-100 text-blue-700' },
      'in-progress': { label: '진행중', className: 'bg-yellow-100 text-yellow-700' },
      submitted: { label: '제출완료', className: 'bg-green-100 text-green-700' },
      completed: { label: '완료', className: 'bg-gray-100 text-gray-700' }
    };
    return statusConfig[status] || statusConfig.preparing;
  }, [status]);

  // 마감일 클래스명 (메모이제이션)
  const deadlineClassName = useMemo(() => {
    const days = displayDaysLeft;
    if (days <= 3) return 'contest-deadline-urgent';
    if (days <= 7) return 'contest-deadline-soon';
    return 'contest-deadline-normal';
  }, [displayDaysLeft]);

  // 진행 상황에 따른 다음 할 일 추천 (메모이제이션)
  const nextAction = useMemo(() => {
    if (status === 'completed') return null;
    
    if (progress < 20) {
      return { text: '기획 단계', icon: Target, color: 'text-blue-600' };
    } else if (progress < 50) {
      return { text: '개발/제작 중', icon: Target, color: 'text-yellow-600' };
    } else if (progress < 80) {
      return { text: '마무리 작업', icon: Target, color: 'text-orange-600' };
    } else {
      return { text: '최종 점검', icon: CheckCircle, color: 'text-green-600' };
    }
  }, [status, progress]);

  // 팀원 수 계산 (메모이제이션)
  const memberCount = useMemo(() => {
    return teamMembers || team_members_count || 0;
  }, [teamMembers, team_members_count]);

  // 팀원 아바타 렌더링 (메모이제이션)

  // 클릭 핸들러 (메모이제이션)
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <div 
      className={`contest-card p-6 animate-fade-in h-[400px] flex flex-col ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={handleClick}
    >
      {/* Header with status and D-day */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground mb-1 truncate leading-tight">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{organization}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
          <Badge className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
          {/* D-day를 상태 배지와 같은 위치에 배치 */}
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${deadlineClassName}`}>
            {displayDaysLeft > 0 ? `D-${displayDaysLeft}` : '마감'}
          </div>
        </div>
      </div>

      {/* 공모전 주제 표시 */}
      {contest_theme && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex-shrink-0">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-purple-600 font-medium">공모주제</p>
              <p className="text-sm font-semibold text-purple-700 line-clamp-2 leading-tight">{contest_theme}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Section - 프로젝트 관리의 핵심 */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">진행률</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mb-3">
          <div 
            className="bg-contest-gradient h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* 다음 할 일 표시 */}
        {nextAction && (
          <div className="flex items-center gap-2 text-sm">
            <nextAction.icon className={`h-4 w-4 ${nextAction.color} flex-shrink-0`} />
            <span className={`${nextAction.color} truncate`}>{nextAction.text}</span>
          </div>
        )}
      </div>

      {/* Project Status Section */}
      <div className="space-y-3 mb-4 flex-shrink-0">
        {/* 마감일 */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">마감: {deadline || '미정'}</span>
        </div>
        
        {/* 팀원 수 (간단하게만 표시) */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{memberCount}명</span>
        </div>

        {/* 카테고리 */}
        {category && (
          <div className="flex items-center">
            <span className="text-sm px-3 py-1 bg-secondary rounded-full truncate max-w-full">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Footer - 경고 표시만 남김 */}
      <div className="flex items-center mt-auto flex-shrink-0">
        {/* Urgency Warning */}
        {displayDaysLeft <= 7 && displayDaysLeft > 0 && (
          <div className="flex-1">
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                <span className="text-xs font-medium truncate">
                  {displayDaysLeft <= 3 ? '마감 임박!' : '마감이 가까워졌습니다'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ContestCard.displayName = 'ContestCard';

export default ContestCard;
