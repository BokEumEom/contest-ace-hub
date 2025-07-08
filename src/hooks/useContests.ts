
import { useState, useEffect } from 'react';
import { ContestService, Contest } from '@/services/contestService';

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);

  // Supabase에서 공모전 데이터 로드
  useEffect(() => {
    const loadContests = async () => {
      setLoading(true);
      try {
        const data = await ContestService.getContests();
        setContests(data);
      } catch (error) {
        console.error('Error loading contests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContests();
  }, []);

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

  const getContestById = (id: number) => {
    return contests.find(contest => contest.id === id);
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
