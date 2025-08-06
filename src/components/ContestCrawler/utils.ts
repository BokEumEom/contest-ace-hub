import { CATEGORY_KEYWORDS, MILLISECONDS_PER_DAY } from './constants';
import { CrawledContest, ContestRegistrationData } from './types';

// 텍스트에서 정보 추출 헬퍼 함수들
export const extractTitle = (text: string): string | null => {
  const titleMatch = text.match(/^#+\s+(.+)|^\*\*(.+)\*\*/m);
  if (titleMatch) return titleMatch[1] || titleMatch[2];
  
  const lines = text.split('\n');
  for (const line of lines.slice(0, 10)) {
    if (line.includes('공모전') || line.includes('대회') || line.includes('경진대회')) {
      return line.trim();
    }
  }
  return null;
};

export const extractOrganization = (text: string): string | null => {
  const orgMatch = text.match(/(?:주최|주관)[:\s]*([^\n]+)/);
  return orgMatch ? orgMatch[1].trim() : null;
};

export const extractDeadline = (text: string): string | null => {
  const dateMatch = text.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  return dateMatch ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}` : null;
};

export const extractCategory = (text: string): string => {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  return '기타';
};

export const extractPrize = (text: string): string | null => {
  const prizeMatch = text.match(/(?:상금|대상|우승)[:\s]*([^\n]+)/);
  return prizeMatch ? prizeMatch[1].trim() : null;
};

export const extractDescription = (text: string): string | null => {
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.length > 30 && !line.includes('마감') && !line.includes('주최')) {
      return line.trim();
    }
  }
  return null;
};

// 날짜 계산 유틸리티
export const calculateDaysLeft = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / MILLISECONDS_PER_DAY);
};

// 공모전 등록 데이터 변환
export const convertToContestRegistrationData = (contest: CrawledContest): ContestRegistrationData => {
  const daysLeft = calculateDaysLeft(contest.deadline);
  
  return {
    title: contest.title,
    organization: contest.organization,
    deadline: contest.deadline,
    category: contest.category,
    prize: contest.prize,
    description: contest.description,
    status: 'preparing',
    days_left: Math.max(0, daysLeft),
    progress: 0,
    team_members_count: 1,
    contest_url: contest.url,
    contest_theme: '',
    submission_format: '',
    contest_schedule: '',
    submission_method: '',
    prize_details: contest.prize,
    result_announcement: '',
    precautions: ''
  };
};

// 키워드 필터링
export const filterContestsByKeywords = (contests: CrawledContest[], keywords: string): CrawledContest[] => {
  if (!keywords.trim()) return contests;
  
  const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
  return contests.filter(contest =>
    keywordList.some(keyword =>
      contest.title.toLowerCase().includes(keyword) ||
      contest.description.toLowerCase().includes(keyword) ||
      contest.category.toLowerCase().includes(keyword)
    )
  );
}; 