
import { useState, useEffect } from 'react';
import { ContestService, Contest } from '@/services/contestService';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from '@/hooks/useProfile';

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [myContests, setMyContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();
  const { addActivity, updateStatistics } = useProfile();

  // 모든 공모전 데이터 로드 (공개 공유)
  useEffect(() => {
    const loadAllContests = async () => {
      if (initialized) return; // 이미 로드된 경우 중복 로드 방지
      
      setLoading(true);
      try {
        const data = await ContestService.getAllContests();
        setContests(data);
        setInitialized(true);
      } catch (error) {
        console.error('Error loading all contests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllContests();
  }, [initialized]);

  // 현재 사용자의 공모전 데이터 로드 (개인 관리용)
  useEffect(() => {
    const loadMyContests = async () => {
      // 인증된 사용자만 개인 공모전 로드
      if (!user) {
        setMyContests([]);
        return;
      }
      
      try {
        const data = await ContestService.getMyContests();
        setMyContests(data);
      } catch (error) {
        console.error('Error loading my contests:', error);
      }
    };

    loadMyContests();
  }, [user]);

  // 사용자가 변경될 때 개인 공모전 데이터 다시 로드
  useEffect(() => {
    if (user) {
      // 사용자가 로그인하면 개인 공모전 다시 로드
      const loadMyContests = async () => {
        try {
          const data = await ContestService.getMyContests();
          setMyContests(data);
        } catch (error) {
          console.error('Error loading my contests:', error);
        }
      };
      loadMyContests();
    } else {
      setMyContests([]); // 로그아웃 시 개인 공모전 초기화
    }
  }, [user]);

  // 공모전 추가
  const addContest = async (contest: Omit<Contest, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const newContest = await ContestService.addContest(contest);
      if (newContest) {
        // 전체 공모전 목록에 추가
        setContests(prev => [newContest, ...prev]);
        // 개인 공모전 목록에 추가
        setMyContests(prev => [newContest, ...prev]);
        
        // 활동 기록
        if (addActivity) {
          addActivity({
            contest_id: newContest.id!,
            activity_type: 'contest_created',
            title: '새 공모전 등록',
            description: `${newContest.title} 공모전을 등록했습니다.`,
            points: 10,
            metadata: {
              contest_id: newContest.id,
              organization: newContest.organization,
              category: newContest.category
            }
          });
        }

        // 통계 업데이트
        if (updateStatistics) {
          updateStatistics({
            total_contests: 1,
            total_points: 10
          });
        }
      }
      return newContest;
    } catch (error) {
      console.error('Error adding contest:', error);
      throw error;
    }
  };

  // 공모전 수정
  const updateContest = async (id: number, updates: Partial<Contest>) => {
    try {
      const updatedContest = await ContestService.updateContest(id, updates);
      if (updatedContest) {
        // 전체 공모전 목록 업데이트
        setContests(prev => 
          prev.map(contest => 
            contest.id === id ? updatedContest : contest
          )
        );
        // 개인 공모전 목록 업데이트
        setMyContests(prev => 
          prev.map(contest => 
            contest.id === id ? updatedContest : contest
          )
        );
      }
      return updatedContest;
    } catch (error) {
      console.error('Error updating contest:', error);
      throw error;
    }
  };

  // 공모전 삭제
  const deleteContest = async (id: number) => {
    try {
      const success = await ContestService.deleteContest(id);
      if (success) {
        // 전체 공모전 목록에서 제거
        setContests(prev => prev.filter(contest => contest.id !== id));
        // 개인 공모전 목록에서 제거
        setMyContests(prev => prev.filter(contest => contest.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error deleting contest:', error);
      throw error;
    }
  };

  // 카테고리별 공모전 조회
  const getContestsByCategory = async (category: string): Promise<Contest[]> => {
    try {
      return await ContestService.getContestsByCategory(category);
    } catch (error) {
      console.error('Error getting contests by category:', error);
      return [];
    }
  };

  // 공모전 검색
  const searchContests = async (query: string): Promise<Contest[]> => {
    try {
      return await ContestService.searchContests(query);
    } catch (error) {
      console.error('Error searching contests:', error);
      return [];
    }
  };

  // 사용자별 공모전 조회
  const getContestsByUser = async (userId: string): Promise<Contest[]> => {
    try {
      return await ContestService.getContestsByUser(userId);
    } catch (error) {
      console.error('Error getting contests by user:', error);
      return [];
    }
  };

  return {
    // 전체 공모전 (모든 사용자가 공유)
    contests,
    // 개인 공모전 (현재 사용자만)
    myContests,
    loading,
    user,
    // 메서드들
    addContest,
    updateContest,
    deleteContest,
    getContestsByCategory,
    searchContests,
    getContestsByUser
  };
};
