
export interface Contest {
  id: string;
  title: string;
  organization: string;
  deadline: string;
  category: string;
  prize: string;
  status: 'preparing' | 'in-progress' | 'submitted' | 'completed';
  daysLeft: number;
  progress: number;
  teamMembers: number;
  description?: string;
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
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
