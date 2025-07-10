
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

export interface ContestSubmission {
  id: string;
  contestId: string;
  title: string;
  description: string;
  fileIds: number[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}
