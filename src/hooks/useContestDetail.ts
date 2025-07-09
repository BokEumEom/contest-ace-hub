import { useState, useEffect } from 'react';
import { useContests } from './useContests';
import { ContestDetailService, TeamMember, Schedule } from '@/services/contestDetailService';
import { ContestService } from '@/services/contestService';

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
  const { getContestById, updateContest, deleteContest } = useContests();
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'files' | 'ai-assistant' | 'results'>('overview');
  
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

  // Contest 로딩 로직 개선
  useEffect(() => {
    if (!contestId) {
      setContest(null);
      setLoading(false);
      return;
    }

    const loadContest = async () => {
      setLoading(true);
      try {
        // 1. 먼저 메모리에서 찾기 (목록에서 진입한 경우)
        const found = getContestById(contestId);
        if (found) {
          setContest(found);
          setLoading(false);
          return;
        }

        // 2. 없으면 서버에서 직접 fetch (직접 URL 진입한 경우)
        const data = await ContestService.getContestById(contestId);
        setContest(data);
      } catch (error) {
        console.error('Error loading contest:', error);
        setContest(null);
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [contestId, getContestById]);

  // 팀원 데이터 Supabase에서 불러오기
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (contest?.id) {
        try {
          const data = await ContestDetailService.getTeamMembers(contest.id);
          setTeamMembers(data);
        } catch (error) {
          console.error('Error loading team members:', error);
        }
      }
    };

    loadTeamMembers();
  }, [contest?.id]);

  // 일정 데이터 Supabase에서 불러오기
  useEffect(() => {
    const loadSchedules = async () => {
      if (contest?.id) {
        try {
          const data = await ContestDetailService.getSchedules(contest.id);
          setSchedules(data);
        } catch (error) {
          console.error('Error loading schedules:', error);
        }
      }
    };

    loadSchedules();
  }, [contest?.id]);

  // 핸들러 함수들
  const handleProgressUpdate = (progress: number) => {
    if (contest) {
      updateContest(contest.id, { progress });
    }
  };

  const handleEditSubmit = async () => {
    if (contest) {
      try {
        // Transform camelCase field names to snake_case for database compatibility
        const transformedUpdates = {
          title: editForm.title,
          organization: editForm.organization,
          deadline: editForm.deadline,
          category: editForm.category,
          prize: editForm.prize,
          description: editForm.description,
          contest_theme: editForm.contestTheme,
          submission_format: editForm.submissionFormat,
          contest_schedule: editForm.contestSchedule,
          submission_method: editForm.submissionMethod,
          prize_details: editForm.prizeDetails,
          result_announcement: editForm.resultAnnouncement,
          precautions: editForm.precautions,
          contest_url: editForm.contestUrl
        };
        
        const updatedContest = await updateContest(contest.id, transformedUpdates);
        if (updatedContest) {
          // 로컬 상태 업데이트
          setContest(updatedContest);
          setEditModalOpen(false);
          alert('공모전 정보가 성공적으로 수정되었습니다.');
        } else {
          alert('공모전 정보 수정에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error updating contest:', error);
        alert('공모전 정보 수정 중 오류가 발생했습니다.');
      }
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (contest) {
      updateContest(contest.id, { status: newStatus as any });
      setStatusModalOpen(false);
      alert(`상태가 "${getStatusText(newStatus)}"로 변경되었습니다.`);
    }
  };

  const handleAddTeamMember = async () => {
    if (newMember.name && newMember.role && contest?.id) {
      const member = {
        id: crypto.randomUUID(),
        name: newMember.name,
        role: newMember.role
      };
      const updatedTeamMembers = [...teamMembers, member];
      setTeamMembers(updatedTeamMembers);
      setNewMember({ name: '', role: '' });
      
      try {
        await ContestDetailService.saveTeamMembers(contest.id, updatedTeamMembers);
        alert(`${newMember.name} 팀원이 추가되었습니다.`);
      } catch (error) {
        console.error('Error saving team member:', error);
        alert('팀원 추가 중 오류가 발생했습니다.');
      }
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (member && contest?.id && confirm(`${member.name} 팀원을 삭제하시겠습니까?`)) {
      const updatedTeamMembers = teamMembers.filter(m => m.id !== id);
      setTeamMembers(updatedTeamMembers);
      
      try {
        await ContestDetailService.saveTeamMembers(contest.id, updatedTeamMembers);
        alert(`${member.name} 팀원이 삭제되었습니다.`);
      } catch (error) {
        console.error('Error removing team member:', error);
        alert('팀원 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAddSchedule = async () => {
    if (newSchedule.title && newSchedule.date && contest?.id) {
      const schedule = {
        id: crypto.randomUUID(),
        title: newSchedule.title,
        date: newSchedule.date,
        description: newSchedule.description,
        completed: false
      };
      const updatedSchedules = [...schedules, schedule];
      setSchedules(updatedSchedules);
      setNewSchedule({ title: '', date: '', description: '' });
      
      try {
        await ContestDetailService.saveSchedules(contest.id, updatedSchedules);
        alert(`"${newSchedule.title}" 일정이 추가되었습니다.`);
      } catch (error) {
        console.error('Error saving schedule:', error);
        alert('일정 추가 중 오류가 발생했습니다.');
      }
    }
  };

  const handleRemoveSchedule = async (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule && contest?.id && confirm(`"${schedule.title}" 일정을 삭제하시겠습니까?`)) {
      const updatedSchedules = schedules.filter(s => s.id !== id);
      setSchedules(updatedSchedules);
      
      try {
        await ContestDetailService.saveSchedules(contest.id, updatedSchedules);
        alert(`"${schedule.title}" 일정이 삭제되었습니다.`);
      } catch (error) {
        console.error('Error removing schedule:', error);
        alert('일정 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteContest = async () => {
    if (contest?.id && confirm(`"${contest.title}" 공모전을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        const success = await deleteContest(contest.id);
        if (success) {
          alert(`"${contest.title}" 공모전이 삭제되었습니다.`);
          return true; // 삭제 성공 시 true 반환
        } else {
          alert('공모전 삭제 중 오류가 발생했습니다.');
          return false;
        }
      } catch (error) {
        console.error('Error deleting contest:', error);
        alert('공모전 삭제 중 오류가 발생했습니다.');
        return false;
      }
    }
    return false; // 삭제 취소 시 false 반환
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
        contestTheme: contest.contest_theme || '',
        submissionFormat: contest.submission_format || '',
        contestSchedule: contest.contest_schedule || '',
        submissionMethod: contest.submission_method || '',
        prizeDetails: contest.prize_details || '',
        resultAnnouncement: contest.result_announcement || '',
        precautions: contest.precautions || '',
        contestUrl: contest.contest_url || ''
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
    loading,
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
    handleDeleteContest,
    openEditModal,
    getStatusColor,
    getStatusText,
    getDaysLeftColor
  };
}; 