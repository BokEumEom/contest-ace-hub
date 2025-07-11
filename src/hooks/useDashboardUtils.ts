import { useCallback, useMemo } from 'react';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';

export const useDashboardUtils = () => {
  // 실시간으로 D-day 계산하는 함수 (메모이제이션)
  const calculateDaysLeft = useCallback((deadline: string) => {
    if (!deadline) return 0;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, []);

  // 통계 계산 (메모이제이션)
  const calculateStats = useCallback((contests: any[], loading: boolean, user: any) => {
    if (loading || !user) return [];
    
    const inProgressContests = contests.filter(c => c.status === 'in-progress' || c.status === 'preparing');
    const submittedContests = contests.filter(c => c.status === 'submitted' || c.status === 'completed');
    const teamProjects = contests.filter(c => (c.team_members_count || 0) > 1);
    
    // 실시간 계산을 사용한 임박한 마감 공모전 필터링
    const urgentContests = contests.filter(c => {
      const realTimeDaysLeft = calculateDaysLeft(c.deadline);
      return realTimeDaysLeft <= 7 && realTimeDaysLeft > 0;
    });

    return [
      { 
        title: '진행중인 공모전', 
        value: inProgressContests.length.toString(), 
        icon: Calendar, 
        color: 'orange' as const, 
        trend: inProgressContests.length > 0 ? { value: '활발히 진행중', isPositive: true } : undefined
      },
      { 
        title: '제출 완료', 
        value: submittedContests.length.toString(), 
        icon: Trophy, 
        color: 'blue' as const,
        trend: submittedContests.length > 0 ? { value: '완료된 프로젝트', isPositive: true } : undefined
      },
      { 
        title: '팀 프로젝트', 
        value: teamProjects.length.toString(), 
        icon: Users, 
        color: 'coral' as const 
      },
      { 
        title: '임박한 마감', 
        value: urgentContests.length.toString(), 
        icon: Clock, 
        color: 'light-blue' as const, 
        trend: urgentContests.length > 0 ? { value: '주의 필요', isPositive: false } : undefined
      }
    ];
  }, [calculateDaysLeft]);

  // 임박한 마감 공모전 (메모이제이션)
  const getUrgentContests = useCallback((contests: any[], loading: boolean, user: any) => {
    if (loading || !user) return [];
    return contests.filter(c => {
      const realTimeDaysLeft = calculateDaysLeft(c.deadline);
      return realTimeDaysLeft <= 7 && realTimeDaysLeft > 0;
    });
  }, [calculateDaysLeft]);

  return {
    calculateDaysLeft,
    calculateStats,
    getUrgentContests
  };
}; 