
import { useState, useEffect } from 'react';
import { Contest } from '@/types/contest';

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);

  // 로컬 스토리지에서 공모전 데이터 로드
  useEffect(() => {
    const savedContests = localStorage.getItem('contests');
    if (savedContests) {
      setContests(JSON.parse(savedContests));
    }
  }, []);

  // 로컬 스토리지에 데이터 저장
  const saveContests = (newContests: Contest[]) => {
    localStorage.setItem('contests', JSON.stringify(newContests));
    setContests(newContests);
  };

  const addContest = (contest: Omit<Contest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContest: Contest = {
      ...contest,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedContests = [...contests, newContest];
    saveContests(updatedContests);
    return newContest;
  };

  const updateContest = (id: string, updates: Partial<Contest>) => {
    const updatedContests = contests.map(contest => 
      contest.id === id 
        ? { ...contest, ...updates, updatedAt: new Date().toISOString() }
        : contest
    );
    saveContests(updatedContests);
  };

  const deleteContest = (id: string) => {
    const updatedContests = contests.filter(contest => contest.id !== id);
    saveContests(updatedContests);
  };

  const getContestById = (id: string) => {
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
