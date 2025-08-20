import { useState, useEffect } from 'react';
import { useContests } from './useContests';
import { ContestDetailService, TeamMember, Schedule } from '@/services/contestDetailService';
import { ContestResultService } from '@/services/contestResultService';
import { ContestService } from '@/services/contestService';
import { useProfile } from '@/hooks/useProfile';
import { UserSearchResult } from '@/services/userService';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

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
  const { updateContest, deleteContest } = useContests();
  const { addActivity, updateStatistics } = useProfile();
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'files' | 'ai-assistant' | 'results'>('overview');
  
  // 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // 안전한 모달 상태 설정 함수들
  const safeSetEditModalOpen = (open: boolean) => {
    if (!contest || loading) {
      console.warn('공모전이 로드되지 않은 상태에서는 편집 모달을 열 수 없습니다.');
      return;
    }
    setEditModalOpen(open);
  };

  const safeSetStatusModalOpen = (open: boolean) => {
    if (!contest || loading) {
      console.warn('공모전이 로드되지 않은 상태에서는 상태 모달을 열 수 없습니다.');
      return;
    }
    setStatusModalOpen(open);
  };

  const safeSetTeamModalOpen = (open: boolean) => {
    if (!contest || loading) {
      console.warn('공모전이 로드되지 않은 상태에서는 팀 모달을 열 수 없습니다.');
      return;
    }
    setTeamModalOpen(open);
  };

  const safeSetScheduleModalOpen = (open: boolean) => {
    if (!contest || loading) {
      console.warn('공모전이 로드되지 않은 상태에서는 일정 모달을 열 수 없습니다.');
      return;
    }
    setScheduleModalOpen(open);
  };
  
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

  // 결과 관리 상태
  const [results, setResults] = useState<any[]>([]);
  const [newResult, setNewResult] = useState({
    description: '',
    status: '',
    prize_amount: '',
    feedback: '',
    announcement_date: new Date().toISOString().split('T')[0],
    file_ids: []
  });

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
        // 서버에서 직접 fetch
        const data = await ContestService.getContestById(parseInt(contestId));
        setContest(data);
      } catch (error) {
        console.error('Error loading contest:', error);
        setContest(null);
      } finally {
        setLoading(false);
      }
    };

    loadContest();
  }, [contestId]);

  // contestId가 변경될 때 모든 모달 상태 초기화
  useEffect(() => {
    setEditModalOpen(false);
    setStatusModalOpen(false);
    setTeamModalOpen(false);
    setScheduleModalOpen(false);
  }, [contestId]);

  // contest 데이터가 로드될 때 모달 상태 초기화
  useEffect(() => {
    if (contest && !loading) {
      // 모든 모달 상태를 강제로 false로 설정
      setEditModalOpen(false);
      setStatusModalOpen(false);
      setTeamModalOpen(false);
      setScheduleModalOpen(false);
      
      // 편집 폼도 초기화
      setEditForm({
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

      // 결과 데이터 로드
      loadResults();
    }
  }, [contest, loading]);

  // 결과 데이터 로드 함수
  const loadResults = async () => {
    if (!contest?.id) return;
    
    try {
      const contestResults = await ContestResultService.getResults(contest.id);
      setResults(contestResults);
    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]);
    }
  };

  // 결과 추가 함수
  const handleAddResult = async () => {
    if (!contest?.id || !newResult.status || !newResult.announcement_date) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      const resultData = {
        description: newResult.description || '',
        status: newResult.status,
        prize_amount: newResult.prize_amount || '',
        feedback: newResult.feedback || '',
        announcement_date: newResult.announcement_date,
        file_ids: newResult.file_ids || []
      };

      await ContestResultService.addResult(contest.id, resultData);
      
      // 결과 목록 새로고침
      await loadResults();
      
      // 폼 초기화
      setNewResult({
        description: '',
        status: '',
        prize_amount: '',
        feedback: '',
        announcement_date: new Date().toISOString().split('T')[0],
        file_ids: []
      });

      alert('결과가 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('Error adding result:', error);
      alert('결과 추가 중 오류가 발생했습니다.');
    }
  };

  // 결과 삭제 함수
  const handleDeleteResult = async (resultId: number) => {
    if (!confirm('정말로 이 결과를 삭제하시겠습니까?')) return;

    try {
      await ContestResultService.deleteResult(resultId);
      await loadResults();
      alert('결과가 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('결과 삭제 중 오류가 발생했습니다.');
    }
  };

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
        // 현재 사용자 정보 확인
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Debug - Submitting edit for contest:', contest.id);
        console.log('Debug - Current user:', user?.id);
        console.log('Debug - Contest owner:', contest.user_id);
        
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
          // 더 구체적인 오류 메시지 제공
          console.error('Failed to update contest. Check console for details.');
          alert('공모전 정보 수정에 실패했습니다. 권한을 확인하거나 다시 시도해주세요.');
        }
      } catch (error) {
        console.error('Error updating contest:', error);
        alert('공모전 정보 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (contest) {
      try {
        const updatedContest = await updateContest(contest.id, { status: newStatus as any });
        if (updatedContest) {
          setContest(updatedContest);
          setStatusModalOpen(false);
          
          // Add activity for status change
          let activityType = 'contest_participated';
          let title = '';
          let description = '';
          let points = 0;

          switch (newStatus) {
            case 'in-progress':
              activityType = 'contest_participated';
              title = `공모전 시작: ${contest.title}`;
              description = `"${contest.title}" 공모전 작업을 시작했습니다.`;
              points = 15;
              break;
            case 'submitted':
              activityType = 'contest_submitted';
              title = `작품 제출: ${contest.title}`;
              description = `"${contest.title}" 공모전에 작품을 제출했습니다.`;
              points = 30;
              break;
            case 'completed':
              activityType = 'contest_completed';
              title = `공모전 완료: ${contest.title}`;
              description = `"${contest.title}" 공모전을 완료했습니다.`;
              points = 50;
              break;
          }

          await addActivity({
            activity_type: activityType as any,
            title,
            description,
            points,
            metadata: { 
              contest_id: contest.id,
              status: newStatus,
              organization: contest.organization
            },
            contest_id: contest.id
          });

          // Update statistics based on status change
          const currentStats = await ContestService.getUserStatistics();
          if (currentStats) {
            const updates: any = {
              last_activity_at: new Date().toISOString()
            };

            if (newStatus === 'completed') {
              updates.completed_contests = (currentStats.completed_contests || 0) + 1;
            }

            await updateStatistics(updates);
          }

          alert(`상태가 "${getStatusText(newStatus)}"로 변경되었습니다.`);
        } else {
          alert('상태 변경에 실패했습니다.');
        }
      } catch (error) {
        console.error('Error changing status:', error);
        alert('상태 변경 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAddTeamMember = async () => {
    if (!newMember.name || !newMember.role) {
      alert('팀원 이름과 역할을 모두 입력해주세요.');
      return;
    }

    try {
      const updatedMembers = [...teamMembers, { id: Date.now().toString(), ...newMember }];
      await ContestDetailService.saveTeamMembers(contest.id, updatedMembers);
      setTeamMembers(updatedMembers);
      setNewMember({ name: '', role: '' });
      setTeamModalOpen(false);
      alert('팀원이 추가되었습니다.');
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('팀원 추가 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    try {
      const updatedMembers = teamMembers.filter(member => member.id !== id);
      await ContestDetailService.saveTeamMembers(contest.id, updatedMembers);
      setTeamMembers(updatedMembers);
      alert('팀원이 제거되었습니다.');
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('팀원 제거 중 오류가 발생했습니다.');
    }
  };

  // 사용자 검색으로 팀원 추가
  const handleAddUserFromSearch = async (user: UserSearchResult) => {
    try {
      const newMember = {
        id: user.id,
        name: user.display_name || user.email,
        role: '팀원',
        email: user.email,
        avatar_url: user.avatar_url
      };
      
      const updatedMembers = [...teamMembers, newMember];
      await ContestDetailService.saveTeamMembers(contest.id, updatedMembers);
      setTeamMembers(updatedMembers);
      alert(`${newMember.name}님이 팀에 추가되었습니다.`);
    } catch (error) {
      console.error('Error adding user from search:', error);
      alert('팀원 추가 중 오류가 발생했습니다.');
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.title || !newSchedule.date) {
      alert('일정 제목과 날짜를 모두 입력해주세요.');
      return;
    }

    try {
      const newScheduleItem = { 
        id: Date.now().toString(), 
        ...newSchedule, 
        completed: false 
      };
      const updatedSchedules = [...schedules, newScheduleItem];
      await ContestDetailService.saveSchedules(contest.id, updatedSchedules);
      setSchedules(updatedSchedules);
      setNewSchedule({ title: '', date: '', description: '' });
      setScheduleModalOpen(false);
      alert('일정이 추가되었습니다.');
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('일정 추가 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveSchedule = async (id: string) => {
    try {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== id);
      await ContestDetailService.saveSchedules(contest.id, updatedSchedules);
      setSchedules(updatedSchedules);
      alert('일정이 제거되었습니다.');
    } catch (error) {
      console.error('Error removing schedule:', error);
      alert('일정 제거 중 오류가 발생했습니다.');
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

  const openEditModal = async () => {
    if (contest) {
      // 다른 모달들을 모두 닫기
      setStatusModalOpen(false);
      setTeamModalOpen(false);
      setScheduleModalOpen(false);
      
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

  // 팀원 추가 (사용자 검색 결과에서)
  const { toast } = useToast();
  const onCloseUserSearch = () => {
    // 사용자 검색 모달을 닫는 로직
    // 예: setUserSearchModalOpen(false);
  };

  const addTeamMemberFromSearch = async (user: UserSearchResult) => {
    if (!contest) return;

    try {
      // 이미 팀원인지 확인
      const existingMember = contest.team_members?.find(
        member => member.id === user.id
      );

      if (existingMember) {
        toast({
          title: "이미 팀원입니다",
          description: `${user.display_name}님은 이미 팀원으로 등록되어 있습니다.`,
          variant: "destructive",
        });
        return;
      }

      // 새 팀원 정보 생성
      const newMember: TeamMember = {
        id: user.id,
        name: user.display_name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: 'member'
      };

      // 팀원 목록 업데이트
      const updatedTeamMembers = [
        ...(contest.team_members || []),
        newMember
      ];

      // contest_details 테이블 업데이트
      // First, check if a record already exists
      const { data: existingRecord } = await supabase
        .from('contest_details')
        .select('id')
        .eq('contest_id', contest.id)
        .eq('detail_type', 'team_members')
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('contest_details')
          .update({
            data: updatedTeamMembers,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);

        if (error) {
          console.error('Error updating team members:', error);
          toast({
            title: "팀원 추가 실패",
            description: "팀원을 추가하는 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('contest_details')
          .insert({
            user_id: contest.user_id,
            contest_id: contest.id,
            detail_type: 'team_members',
            data: updatedTeamMembers
          });

        if (error) {
          console.error('Error inserting team members:', error);
          toast({
            title: "팀원 추가 실패",
            description: "팀원을 추가하는 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          return;
        }
      }

      // 로컬 상태 업데이트
      setContest(prev => prev ? {
        ...prev,
        team_members: updatedTeamMembers,
        team_members_count: updatedTeamMembers.length
      } : null);

      toast({
        title: "팀원 추가 완료",
        description: `${user.display_name}님이 팀에 추가되었습니다.`,
      });

      // 사용자 검색 모달 닫기
      if (onCloseUserSearch) {
        onCloseUserSearch();
      }
    } catch (error) {
      console.error('Error adding team member from search:', error);
      toast({
        title: "팀원 추가 실패",
        description: "팀원을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
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
    results,
    newResult,
    setNewResult,
    handleProgressUpdate,
    handleEditSubmit,
    handleStatusChange,
    handleAddTeamMember,
    handleRemoveTeamMember,
    handleAddUserFromSearch,
    handleAddSchedule,
    handleRemoveSchedule,
    handleDeleteContest,
    openEditModal,
    getStatusColor,
    getStatusText,
    getDaysLeftColor,
    updateContest, // 추가: 외부에서 updateContest 사용 가능
    addTeamMemberFromSearch, // 추가: 사용자 검색 결과에서 팀원 추가 함수
    handleAddResult, // 추가: 결과 추가 함수
    handleDeleteResult // 추가: 결과 삭제 함수
  };
}; 