import { useState, useEffect } from 'react';

interface ContestResult {
  id: string;
  rank: number;
  team_name: string;
  members: string[];
  score: number;
  status: 'winner' | 'shortlisted' | 'participant';
  submitted_at: string;
  feedback?: string;
}

interface ContestStats {
  total_participants: number;
  total_teams: number;
  winners_count: number;
  shortlisted_count: number;
  average_score: number;
}

interface UseContestResultsParams {
  contestId?: string;
  userId?: string;
}

export const useContestResults = ({ contestId, userId }: UseContestResultsParams) => {
  const [results, setResults] = useState<ContestResult[]>([]);
  const [stats, setStats] = useState<ContestStats>({
    total_participants: 0,
    total_teams: 0,
    winners_count: 0,
    shortlisted_count: 0,
    average_score: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockResults: ContestResult[] = [
    {
      id: '1',
      rank: 1,
      team_name: 'AI 팀',
      members: ['김철수', '이영희', '박민수'],
      score: 95,
      status: 'winner',
      submitted_at: '2024-01-25T10:30:00Z',
      feedback: '혁신적인 AI 솔루션으로 우수한 성과를 보여주었습니다.'
    },
    {
      id: '2',
      rank: 2,
      team_name: '창작팀',
      members: ['최지영', '정현우'],
      score: 88,
      status: 'winner',
      submitted_at: '2024-01-26T14:20:00Z',
      feedback: '창의적인 접근 방식이 돋보였습니다.'
    },
    {
      id: '3',
      rank: 3,
      team_name: '개발팀',
      members: ['한소영', '김태현', '이미영', '박준호'],
      score: 82,
      status: 'shortlisted',
      submitted_at: '2024-01-27T09:15:00Z'
    },
    {
      id: '4',
      rank: 4,
      team_name: '디자인팀',
      members: ['윤서연', '강동현'],
      score: 78,
      status: 'shortlisted',
      submitted_at: '2024-01-28T16:45:00Z'
    },
    {
      id: '5',
      rank: 5,
      team_name: '기획팀',
      members: ['송민지', '이준호', '김수진'],
      score: 75,
      status: 'participant',
      submitted_at: '2024-01-29T11:30:00Z'
    }
  ];

  const mockStats: ContestStats = {
    total_participants: 12,
    total_teams: 5,
    winners_count: 2,
    shortlisted_count: 2,
    average_score: 83.6
  };

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock API response
      setResults(mockResults);
      setStats(mockStats);
    } catch (err) {
      setError('결과를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contestId) {
      fetchResults();
    }
  }, [contestId]);

  const filterResultsByStatus = (status: string) => {
    return results.filter(result => result.status === status);
  };

  const getMyResult = () => {
    if (!userId) return null;
    
    // Mock: find result where user is a member
    return results.find(result => 
      result.members.some(member => 
        member.toLowerCase().includes('김철수') // Mock user match
      )
    ) || null;
  };

  const sortResultsByRank = () => {
    return [...results].sort((a, b) => a.rank - b.rank);
  };

  const refetch = () => {
    fetchResults();
  };

  return {
    results,
    stats,
    isLoading,
    error,
    filterResultsByStatus,
    getMyResult,
    sortResultsByRank,
    refetch
  };
}; 