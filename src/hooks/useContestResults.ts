import { useState, useEffect } from 'react';
import { ContestResult, ContestResultStats } from '@/types/contest';

interface UseContestResultsProps {
  contestId?: string;
  userId?: string;
}

export const useContestResults = ({ contestId, userId }: UseContestResultsProps) => {
  const [results, setResults] = useState<ContestResult[]>([]);
  const [stats, setStats] = useState<ContestResultStats>({
    totalSubmissions: 0,
    shortlistedCount: 0,
    winnerCount: 0,
    runnerUpCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 실제 API 호출을 시뮬레이션하는 함수
  const fetchResults = async () => {
    if (!contestId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 실제 구현에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 더미 데이터
      const mockResults: ContestResult[] = [
        {
          id: '1',
          contestId: contestId,
          contestTitle: 'AI 창작 공모전',
          organization: '한국정보산업연합회',
          submission: {
            id: 'sub1',
            contestId: contestId,
            userId: userId || 'user1',
            teamName: 'AI 팀',
            projectTitle: 'AI 기반 창작 도구 개발',
            description: '사용자가 쉽게 창작할 수 있는 AI 도구를 개발했습니다. 다양한 텍스트 생성과 이미지 편집 기능을 제공합니다.',
            submissionFiles: [],
            submittedAt: '2024-01-15T10:00:00Z',
            status: 'winner',
            score: 95,
            feedback: '혁신적인 아이디어와 완성도 높은 구현이 돋보입니다. 사용자 경험을 고려한 UI/UX 설계가 우수합니다.',
            resultAnnouncedAt: '2024-02-01T14:00:00Z'
          },
          rank: 1,
          prizeAmount: '500만원',
          certificateUrl: '/certificates/winner-1.pdf',
          announcementDate: '2024-02-01'
        },
        {
          id: '2',
          contestId: contestId,
          contestTitle: 'AI 창작 공모전',
          organization: '한국정보산업연합회',
          submission: {
            id: 'sub2',
            contestId: contestId,
            userId: 'user2',
            teamName: '창작팀',
            projectTitle: '다양한 창작 도구 모음',
            description: '다양한 창작 도구를 하나의 플랫폼에 모아서 제공하는 서비스입니다.',
            submissionFiles: [],
            submittedAt: '2024-01-14T15:30:00Z',
            status: 'runner_up',
            score: 88,
            feedback: '실용적인 접근 방식이 좋습니다. 다만 사용자 인터페이스 개선의 여지가 있습니다.',
            resultAnnouncedAt: '2024-02-01T14:00:00Z'
          },
          rank: 2,
          prizeAmount: '300만원',
          certificateUrl: '/certificates/runner-up-2.pdf',
          announcementDate: '2024-02-01'
        },
        {
          id: '3',
          contestId: contestId,
          contestTitle: 'AI 창작 공모전',
          organization: '한국정보산업연합회',
          submission: {
            id: 'sub3',
            contestId: contestId,
            userId: 'user3',
            teamName: '혁신팀',
            projectTitle: 'AI 기반 협업 도구',
            description: '팀원들이 함께 창작할 수 있는 AI 기반 협업 도구입니다.',
            submissionFiles: [],
            submittedAt: '2024-01-13T09:15:00Z',
            status: 'shortlisted',
            score: 82,
            feedback: '협업 기능이 잘 구현되어 있습니다. 추가적인 기능 확장이 기대됩니다.',
            resultAnnouncedAt: '2024-02-01T14:00:00Z'
          },
          rank: 3,
          prizeAmount: '100만원',
          certificateUrl: '/certificates/shortlisted-3.pdf',
          announcementDate: '2024-02-01'
        }
      ];

      const mockStats: ContestResultStats = {
        totalSubmissions: 25,
        shortlistedCount: 5,
        winnerCount: 1,
        runnerUpCount: 2,
        averageScore: 78.5,
        myRank: 1,
        myScore: 95
      };

      setResults(mockResults);
      setStats(mockStats);
    } catch (err) {
      setError('결과를 불러오는 중 오류가 발생했습니다.');
      console.error('Error fetching contest results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 결과 필터링 함수
  const filterResultsByStatus = (status: string) => {
    return results.filter(result => result.submission.status === status);
  };

  // 내 결과 찾기
  const getMyResult = () => {
    return results.find(result => result.submission.userId === userId);
  };

  // 결과 정렬 함수
  const sortResultsByRank = () => {
    return [...results].sort((a, b) => {
      if (!a.rank && !b.rank) return 0;
      if (!a.rank) return 1;
      if (!b.rank) return -1;
      return a.rank - b.rank;
    });
  };

  useEffect(() => {
    if (contestId) {
      fetchResults();
    }
  }, [contestId, userId]);

  return {
    results,
    stats,
    isLoading,
    error,
    filterResultsByStatus,
    getMyResult,
    sortResultsByRank,
    refetch: fetchResults
  };
}; 