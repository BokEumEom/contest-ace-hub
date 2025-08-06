import { ContestFormData, ContestRegistrationData } from './types';
import { MILLISECONDS_PER_DAY, DEFAULT_PROGRESS, DEFAULT_STATUS, REQUIRED_FIELDS } from './constants';

// 날짜 계산 유틸리티
export const calculateDaysLeft = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / MILLISECONDS_PER_DAY);
};

// 폼 데이터를 등록 데이터로 변환
export const convertToContestRegistrationData = (formData: ContestFormData): ContestRegistrationData => {
  const daysLeft = calculateDaysLeft(formData.deadline);
  
  return {
    title: formData.title,
    organization: formData.organization,
    deadline: formData.deadline,
    category: formData.category,
    prize: formData.prize,
    description: formData.description,
    contest_theme: formData.contestTheme,
    submission_format: formData.submissionFormat,
    contest_schedule: formData.contestSchedule,
    submission_method: formData.submissionMethod,
    prize_details: formData.prizeDetails,
    result_announcement: formData.resultAnnouncement,
    precautions: formData.precautions,
    contest_url: formData.contestUrl,
    status: DEFAULT_STATUS,
    days_left: daysLeft,
    progress: DEFAULT_PROGRESS,
    team_members_count: formData.teamMembers,
  };
};

// 필수 필드 검증
export const validateRequiredFields = (formData: ContestFormData): boolean => {
  return REQUIRED_FIELDS.every(field => {
    const value = formData[field as keyof ContestFormData];
    return value && value.toString().trim() !== '';
  });
};

// AI 추출 결과를 폼 데이터로 변환
export const convertAIToFormData = (contestInfo: any, url?: string): ContestFormData => {
  return {
    title: contestInfo.title || '',
    organization: contestInfo.organization || '',
    deadline: contestInfo.deadline || '',
    category: contestInfo.category || '',
    prize: contestInfo.prize || '',
    description: contestInfo.description || '',
    teamMembers: 1,
    contestTheme: contestInfo.contestTheme || '',
    submissionFormat: contestInfo.submissionFormat || '',
    contestSchedule: contestInfo.contestSchedule || '',
    submissionMethod: contestInfo.submissionMethod || '',
    prizeDetails: contestInfo.prizeDetails || '',
    resultAnnouncement: contestInfo.resultAnnouncement || '',
    precautions: contestInfo.precautions || '',
    contestUrl: url || contestInfo.contestUrl || '',
  };
}; 