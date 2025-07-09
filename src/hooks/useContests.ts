
import { useState, useEffect } from 'react';
import { ContestService, Contest } from '@/services/contestService';
import { useAuth } from '@/components/AuthProvider';

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();

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
        setContests(prev => 
          prev.map(contest => 
            contest.id === id ? updatedContest : contest
          )
        );
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
    getContestById,
  };
};
