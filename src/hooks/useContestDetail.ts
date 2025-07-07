import { useState, useEffect } from 'react';
import { useContests } from './useContests';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface Schedule {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface EditForm {
  title: string;
  organization: string;
  deadline: string;
  category: string;
  prize: string;
  description: string;
  contestTheme: string;
  submissionFormat: string;
  contestSchedule: string;
  submissionMethod: string;
  prizeDetails: string;
  resultAnnouncement: string;
  precautions: string;
  contestUrl: string;
}

export const useContestDetail = (contestId: string | undefined) => {
  const { getContestById, updateContest } = useContests();
  const contest = contestId ? getContestById(contestId) : null;

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'schedule' | 'awards' | 'precautions'>('overview');
  
  // 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  
  // 수정 폼 상태
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    organization: '',
    deadline: '',
    category: '',
    prize: '',
    description: '',
    contestTheme: '',
    submissionFormat: '',
    contestSchedule: '',
    submissionMethod: '',
    prizeDetails: '',
    resultAnnouncement: '',
    precautions: '',
    contestUrl: ''
  });
  
  // 팀원 관리 상태
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  
  // 일정 관리 상태
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState({ title: '', date: '', description: '' });

  // 팀원 데이터 로컬 스토리지에서 불러오기
  useEffect(() => {
    if (contest?.id) {
      const saved = localStorage.getItem(`teamMembers_${contest.id}`);
      if (saved) {
        setTeamMembers(JSON.parse(saved));
      }
    }
  }, [contest?.id]);

  // 일정 데이터 로컬 스토리지에서 불러오기
  useEffect(() => {
    if (contest?.id) {
      const saved = localStorage.getItem(`schedules_${contest.id}`);
      if (saved) {
        setSchedules(JSON.parse(saved));
      }
    }
  }, [contest?.id]);

  // 팀원 데이터 로컬 스토리지 저장
  useEffect(() => {
    if (contest?.id && teamMembers.length > 0) {
      localStorage.setItem(`teamMembers_${contest.id}`, JSON.stringify(teamMembers));
    }
  }, [teamMembers, contest?.id]);

  // 일정 데이터 로컬 스토리지 저장
  useEffect(() => {
    if (contest?.id && schedules.length > 0) {
      localStorage.setItem(`schedules_${contest.id}`, JSON.stringify(schedules));
    }
  }, [schedules, contest?.id]);

  // 핸들러 함수들
  const handleProgressUpdate = (progress: number) => {
    if (contest) {
      updateContest(contest.id, { progress });
    }
  };

  const handleEditSubmit = () => {
    if (contest) {
      updateContest(contest.id, editForm);
      setEditModalOpen(false);
      alert('공모전 정보가 성공적으로 수정되었습니다.');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (contest) {
      updateContest(contest.id, { status: newStatus as any });
      setStatusModalOpen(false);
      alert(`상태가 "${getStatusText(newStatus)}"로 변경되었습니다.`);
    }
  };

  const handleAddTeamMember = () => {
    if (newMember.name && newMember.role) {
      const member = {
        id: crypto.randomUUID(),
        name: newMember.name,
        role: newMember.role
      };
      setTeamMembers([...teamMembers, member]);
      setNewMember({ name: '', role: '' });
      alert(`${newMember.name} 팀원이 추가되었습니다.`);
    }
  };

  const handleRemoveTeamMember = (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (member && confirm(`${member.name} 팀원을 삭제하시겠습니까?`)) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
      alert(`${member.name} 팀원이 삭제되었습니다.`);
    }
  };

  const handleAddSchedule = () => {
    if (newSchedule.title && newSchedule.date) {
      const schedule = {
        id: crypto.randomUUID(),
        title: newSchedule.title,
        date: newSchedule.date,
        description: newSchedule.description
      };
      setSchedules([...schedules, schedule]);
      setNewSchedule({ title: '', date: '', description: '' });
      alert(`"${newSchedule.title}" 일정이 추가되었습니다.`);
    }
  };

  const handleRemoveSchedule = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule && confirm(`"${schedule.title}" 일정을 삭제하시겠습니까?`)) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
      alert(`"${schedule.title}" 일정이 삭제되었습니다.`);
    }
  };

  const openEditModal = () => {
    if (contest) {
      setEditForm({
        title: contest.title,
        organization: contest.organization,
        deadline: contest.deadline,
        category: contest.category,
        prize: contest.prize,
        description: contest.description || '',
        contestTheme: contest.contestTheme || '',
        submissionFormat: contest.submissionFormat || '',
        contestSchedule: contest.contestSchedule || '',
        submissionMethod: contest.submissionMethod || '',
        prizeDetails: contest.prizeDetails || '',
        resultAnnouncement: contest.resultAnnouncement || '',
        precautions: contest.precautions || '',
        contestUrl: contest.contestUrl || ''
      });
      setEditModalOpen(true);
    }
  };

  // 유틸리티 함수들
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'submitted': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing': return '준비중';
      case 'in-progress': return '진행중';
      case 'submitted': return '제출완료';
      case 'completed': return '완료';
      default: return status;
    }
  };

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 7) return 'text-red-600 bg-red-50';
    if (daysLeft <= 30) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return {
    contest,
    activeTab,
    setActiveTab,
    editModalOpen,
    setEditModalOpen,
    statusModalOpen,
    setStatusModalOpen,
    teamModalOpen,
    setTeamModalOpen,
    scheduleModalOpen,
    setScheduleModalOpen,
    editForm,
    setEditForm,
    teamMembers,
    newMember,
    setNewMember,
    schedules,
    newSchedule,
    setNewSchedule,
    handleProgressUpdate,
    handleEditSubmit,
    handleStatusChange,
    handleAddTeamMember,
    handleRemoveTeamMember,
    handleAddSchedule,
    handleRemoveSchedule,
    openEditModal,
    getStatusColor,
    getStatusText,
    getDaysLeftColor
  };
}; 