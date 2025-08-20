
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

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
  tasks?: Task[]; // 추가: 진행상황 체크리스트
}

// 공모전 결과 관련 타입 추가
export interface ContestResult {
  id?: number;
  contest_id: number;
  description?: string;
  status: string;
  prize_amount?: string;
  feedback?: string;
  announcement_date: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // 작품과의 연결
  file_ids?: number[]; // 관련 파일 ID들
}

export interface ContestResultFormData {
  description: string;
  status: string;
  prize_amount: string;
  feedback: string;
  announcement_date: string;
  file_ids?: string[];
}

export interface ContestIdea {
  id: string;
  contestId: string;
  title: string;
  description: string;
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
  canEdit?: boolean; // 편집 권한
  canDelete?: boolean; // 삭제 권한
}
