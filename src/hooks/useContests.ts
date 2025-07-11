
import { useState, useEffect } from 'react';
import { ContestService, Contest } from '@/services/contestService';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from '@/hooks/useProfile';

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();
  const { addActivity, updateStatistics } = useProfile();

  // 공모전 데이터 로드
  useEffect(() => {
    const loadContests = async () => {
      if (initialized) return; // 이미 로드된 경우 중복 로드 방지
      
      // 인증된 사용자만 데이터 로드
      if (!user) {
        setContests([]);
        setInitialized(true);
        return;
      }
      
      setLoading(true);
      try {
        const data = await ContestService.getContests();
        setContests(data);
        setInitialized(true);
      } catch (error) {
        console.error('Error loading contests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContests();
  }, [initialized, user]);

  // 사용자가 변경될 때 데이터 다시 로드
  useEffect(() => {
    if (user) {
      setInitialized(false); // 데이터 다시 로드하도록 플래그 리셋
    } else {
      setContests([]); // 로그아웃 시 데이터 초기화
      setInitialized(true);
    }
  }, [user]);

  const addContest = async (contest: Omit<Contest, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newContest = await ContestService.addContest(contest);
      if (newContest) {
        setContests(prev => [newContest, ...prev]);
        
        // Add activity for contest creation
        await addActivity({
          activity_type: 'contest_created',
          title: `새 공모전 등록: ${contest.title}`,
          description: `${contest.organization}에서 주최하는 "${contest.title}" 공모전을 등록했습니다.`,
          points: 20,
          metadata: { 
            contest_id: newContest.id,
            organization: contest.organization,
            category: contest.category,
            deadline: contest.deadline
          },
          contest_id: newContest.id
        });

        // Update user statistics
        const currentStats = await ContestService.getUserStatistics();
        if (currentStats) {
          await updateStatistics({
            total_contests: (currentStats.total_contests || 0) + 1,
            last_activity_at: new Date().toISOString()
          });
        } else {
          // Initialize statistics if they don't exist
          await updateStatistics({
            total_contests: 1,
            last_activity_at: new Date().toISOString()
          });
        }

        return newContest;
      }
      return null;
    } catch (error) {
      console.error('Error adding contest:', error);
      return null;
    }
  };

  const updateContest = async (id: number, updates: Partial<Contest>) => {
    try {
      const updatedContest = await ContestService.updateContest(id, updates);
      if (updatedContest) {
        setContests(prev => prev.map(contest => 
          contest.id === id ? updatedContest : contest
        ));

        // Add activity for contest updates
        if (updates.status) {
          let activityType = 'contest_participated';
          let title = '';
          let description = '';
          let points = 0;

          switch (updates.status) {
            case 'in-progress':
              activityType = 'contest_participated';
              title = `공모전 시작: ${updatedContest.title}`;
              description = `"${updatedContest.title}" 공모전 작업을 시작했습니다.`;
              points = 15;
              break;
            case 'submitted':
              activityType = 'contest_submitted';
              title = `작품 제출: ${updatedContest.title}`;
              description = `"${updatedContest.title}" 공모전에 작품을 제출했습니다.`;
              points = 30;
              break;
            case 'completed':
              activityType = 'contest_completed';
              title = `공모전 완료: ${updatedContest.title}`;
              description = `"${updatedContest.title}" 공모전을 완료했습니다.`;
              points = 50;
              break;
          }

          await addActivity({
            activity_type: activityType as any,
            title,
            description,
            points,
            metadata: { 
              contest_id: updatedContest.id,
              status: updates.status,
              organization: updatedContest.organization
            },
            contest_id: updatedContest.id
          });

          // Update statistics based on status change
          const currentStats = await ContestService.getUserStatistics();
          if (currentStats) {
            const updates: any = {
              last_activity_at: new Date().toISOString()
            };

            if (updates.status === 'completed') {
              updates.completed_contests = (currentStats.completed_contests || 0) + 1;
            }

            await updateStatistics(updates);
          } else {
            // Initialize statistics if they don't exist
            const updates: any = {
              last_activity_at: new Date().toISOString()
            };

            if (updates.status === 'completed') {
              updates.completed_contests = 1;
            }

            await updateStatistics(updates);
          }
        }

        return updatedContest;
      }
      return null;
    } catch (error) {
      console.error('Error updating contest:', error);
      return null;
    }
  };

  const deleteContest = async (id: number) => {
    try {
      const success = await ContestService.deleteContest(id);
      if (success) {
        setContests(prev => prev.filter(contest => contest.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting contest:', error);
      return false;
    }
  };

  const getContestById = (id: number | string) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return contests.find(contest => contest.id === numericId);
  };

  return {
    contests,
    loading,
    addContest,
    updateContest,
    deleteContest,
    refresh: () => {
      setInitialized(false);
    }
  };
};
