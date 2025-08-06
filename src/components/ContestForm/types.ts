import { Contest } from '@/types/contest';

export interface ContestFormProps {
  onSuccess?: (contest: Contest) => void;
  onCancel?: () => void;
}

export interface ContestFormData {
  title: string;
  organization: string;
  deadline: string;
  category: string;
  prize: string;
  description: string;
  teamMembers: number;
  contestTheme: string;
  submissionFormat: string;
  contestSchedule: string;
  submissionMethod: string;
  prizeDetails: string;
  resultAnnouncement: string;
  precautions: string;
  contestUrl: string;
}

export type AIMethod = 'url' | 'text';

export interface ContestRegistrationData {
  title: string;
  organization: string;
  deadline: string;
  category: string;
  prize: string;
  description: string;
  contest_theme: string;
  submission_format: string;
  contest_schedule: string;
  submission_method: string;
  prize_details: string;
  result_announcement: string;
  precautions: string;
  contest_url: string;
  status: 'preparing';
  days_left: number;
  progress: number;
  team_members_count: number;
}

export interface AIIntegrationState {
  urlInput: string;
  textInput: string;
  isLoading: boolean;
  showUrlSection: boolean;
  activeMethod: AIMethod;
} 