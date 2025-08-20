import { useState, useEffect, useCallback } from 'react';
import { ContestResultService } from '@/services/contestResultService';
import { ContestResult, ContestResultFormData } from '@/types/contest';

interface ContestStats {
  total_results: number;
  winners_count: number;
  runner_ups_count: number;
  shortlisted_count: number;
  participants_count: number;
  honorable_mentions_count: number;
  average_score: number;
}

interface UseContestResultsParams {
  contestId?: string;
  userId?: string;
}

export const useContestResults = ({ contestId, userId }: UseContestResultsParams) => {
  const [results, setResults] = useState<ContestResult[]>([]);
  const [stats, setStats] = useState<ContestStats>({
    total_results: 0,
    winners_count: 0,
    runner_ups_count: 0,
    shortlisted_count: 0,
    participants_count: 0,
    honorable_mentions_count: 0,
    average_score: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 결과 목록 조회
  const fetchResults = useCallback(async () => {
    if (!contestId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const [resultsData, statsData] = await Promise.all([
        ContestResultService.getResults(parseInt(contestId)),
        ContestResultService.getResultStats(parseInt(contestId))
      ]);
      
      setResults(resultsData);
      setStats(statsData);
    } catch (err) {
      setError('결과를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching results:', err);
    } finally {
      setIsLoading(false);
    }
  }, [contestId]);

  // 결과 추가
  const addResult = useCallback(async (resultData: ContestResultFormData): Promise<boolean> => {
    if (!contestId) return false;

    try {
      setIsLoading(true);
      const newResult = await ContestResultService.addResult(parseInt(contestId), resultData);
      
      if (newResult) {
        setResults(prev => [...prev, newResult]);
        // 통계 새로고침
        const updatedStats = await ContestResultService.getResultStats(parseInt(contestId));
        setStats(updatedStats);
        return true;
      }
      return false;
    } catch (err) {
      setError('결과 추가 중 오류가 발생했습니다.');
      console.error('Error adding result:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contestId]);

  // 결과 수정
  const updateResult = useCallback(async (resultId: number, updates: Partial<ContestResult>): Promise<boolean> => {
    try {
      setIsLoading(true);
      const updatedResult = await ContestResultService.updateResult(resultId, updates);
      
      if (updatedResult) {
        setResults(prev => 
          prev.map(result => 
            result.id === resultId ? updatedResult : result
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError('결과 수정 중 오류가 발생했습니다.');
      console.error('Error updating result:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 결과 삭제
  const deleteResult = useCallback(async (resultId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await ContestResultService.deleteResult(resultId);
      
      if (success) {
        setResults(prev => prev.filter(result => result.id !== resultId));
        // 통계 새로고침
        if (contestId) {
          const updatedStats = await ContestResultService.getResultStats(parseInt(contestId));
          setStats(updatedStats);
        }
        return true;
      }
      return false;
    } catch (err) {
      setError('결과 삭제 중 오류가 발생했습니다.');
      console.error('Error deleting result:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contestId]);

  // 결과 필터링
  const filterResultsByStatus = useCallback((status: string) => {
    return results.filter(result => result.status === status);
  }, [results]);

  // 내 결과 조회 (참가자용)
  const getMyResult = useCallback(() => {
    if (!userId) return null;
    
    // 실제로는 사용자 ID로 참가한 팀을 찾아야 함
    // 현재는 간단한 예시로 구현
    return results.find(result => 
      result.team_name.toLowerCase().includes('팀') // 임시 로직
    ) || null;
  }, [results, userId]);

  // 순위별 정렬
  const sortResultsByRank = useCallback(() => {
    return [...results].sort((a, b) => {
      // 상태별 우선순위로 정렬
      const statusPriority = {
        'awarded_1st': 1,
        'awarded_2nd': 2,
        'awarded_3rd': 3,
        'special_award': 4,
        'final_selected': 5,
        'excellent_work': 6,
        'idea_award': 7,
        'submitted': 8,
        'under_review': 9,
        'review_completed': 10,
        'not_selected': 11,
        'needs_revision': 12
      };
      
      const priorityA = statusPriority[a.status] || 999;
      const priorityB = statusPriority[b.status] || 999;
      
      return priorityA - priorityB;
    });
  }, [results]);

  // 데이터 새로고침
  const refetch = useCallback(() => {
    fetchResults();
  }, [fetchResults]);

  // 초기 데이터 로드
  useEffect(() => {
    if (contestId) {
      fetchResults();
    }
  }, [contestId, fetchResults]);

  return {
    // 상태
    results,
    stats,
    isLoading,
    error,
    
    // 메서드
    addResult,
    updateResult,
    deleteResult,
    filterResultsByStatus,
    getMyResult,
    sortResultsByRank,
    refetch,
    fetchResults
  };
}; 