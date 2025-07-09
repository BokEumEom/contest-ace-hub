
export interface Contest {
  id: string;
  title: string;
  organization: string;
  deadline: string;
  category: string;
  prize: string;
  status: 'preparing' | 'in-progress' | 'submitted' | 'completed';
  days_left: number;
  progress: number;
  team_members_count: number;
  description?: string;
  requirements?: string[];
  contest_theme?: string;
  submission_format?: string;
  contest_schedule?: string;
  submission_method?: string;
  prize_details?: string;
  result_announcement?: string;
  precautions?: string;
  contest_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ContestIdea {
  id: string;
  contestId: string;
  title: string;
  description: string;
  aiGenerated: boolean;
  createdAt: string;
}

export interface ContestFile {
  id: string;
  contestId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

// 공모전 지원 결과 관련 타입들
export interface ContestSubmission {
  id: string;
  contestId: string;
  userId: string;
  teamName: string;
  projectTitle: string;
  description: string;
  submissionFiles: ContestFile[];
  submittedAt: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'winner' | 'runner_up' | 'not_selected';
  score?: number;
  feedback?: string;
  resultAnnouncedAt?: string;
}

export interface ContestResult {
  id: string;
  contestId: string;
  contestTitle: string;
  organization: string;
  submission: ContestSubmission;
  rank?: number;
  prizeAmount?: string;
  certificateUrl?: string;
  announcementDate: string;
}

export interface ContestResultStats {
  totalSubmissions: number;
  shortlistedCount: number;
  winnerCount: number;
  runnerUpCount: number;
  averageScore?: number;
  myRank?: number;
  myScore?: number;
}
