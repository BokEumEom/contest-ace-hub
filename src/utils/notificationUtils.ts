
import { useNotifications } from '@/hooks/useNotifications';

export const createNotificationMessages = {
  contestCreated: (title: string) => ({
    title: '새 공모전 등록',
    message: `"${title}" 공모전이 성공적으로 등록되었습니다.`,
    type: 'success' as const
  }),
  
  contestDeadlineApproaching: (title: string, days: number) => ({
    title: '마감일 임박',
    message: `"${title}" 공모전 마감일이 ${days}일 남았습니다.`,
    type: 'warning' as const
  }),
  
  contestCompleted: (title: string) => ({
    title: '공모전 완료',
    message: `"${title}" 공모전이 완료되었습니다.`,
    type: 'success' as const
  }),
  
  progressUpdated: (title: string, progress: number) => ({
    title: '진행률 업데이트',
    message: `"${title}" 공모전 진행률이 ${progress}%로 업데이트되었습니다.`,
    type: 'info' as const
  })
};
