import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Users, 
  Clock, 
  Trophy, 
  Edit, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Contest } from '@/services/contestService';
import { TeamMember, Schedule } from '@/services/contestDetailService';
import { EditContestModal } from './EditContestModal';
import { TeamManagementModal } from './TeamManagementModal';
import { ScheduleManagementModal } from './ScheduleManagementModal';
import { supabase } from '@/lib/supabase';

interface ContestSidebarProps {
  contest: Contest;
  teamMembers: TeamMember[];
  schedules: Schedule[];
  // 모달 상태
  editModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  statusModalOpen: boolean;
  setStatusModalOpen: (open: boolean) => void;
  teamModalOpen: boolean;
  setTeamModalOpen: (open: boolean) => void;
  scheduleModalOpen: boolean;
  setScheduleModalOpen: (open: boolean) => void;
  // 폼 상태
  editForm: any;
  setEditForm: (form: any) => void;
  newMember: { name: string; role: string };
  setNewMember: (member: { name: string; role: string }) => void;
  newSchedule: { title: string; date: string; description: string };
  setNewSchedule: (schedule: { title: string; date: string; description: string }) => void;
  // 핸들러
  handleEditSubmit: () => Promise<void>;
  handleStatusChange: (status: string) => void;
  handleAddTeamMember: () => void;
  handleRemoveTeamMember: (id: string) => void;
  handleAddUserFromSearch?: (user: any) => void;
  handleAddSchedule: () => void;
  handleRemoveSchedule: (id: string) => void;
  handleDeleteContest: () => Promise<boolean>;
  openEditModal: () => Promise<void>;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getDaysLeftColor: (daysLeft: number) => string;
}

export const ContestSidebar: React.FC<ContestSidebarProps> = ({
  contest,
  teamMembers,
  schedules,
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
  newMember,
  setNewMember,
  newSchedule,
  setNewSchedule,
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
  getDaysLeftColor
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  // 현재 사용자 정보 로드
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setIsOwner(user?.id === contest?.user_id);
    };

    if (contest) {
      loadCurrentUser();
    }
  }, [contest]);

  return (
    <div className="space-y-6">
      {/* 빠른 작업 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">빠른 작업</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 권한이 있는 경우에만 수정 버튼 표시 */}
          {isOwner ? (
            <EditContestModal
              open={editModalOpen}
              onOpenChange={setEditModalOpen}
              editForm={editForm}
              setEditForm={setEditForm}
              onSubmit={handleEditSubmit}
              onOpen={openEditModal}
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                공모전 작성자만 수정할 수 있습니다
              </span>
            </div>
          )}

          {/* 상태 변경 모달 */}
          <div className="relative">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => setStatusModalOpen(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              상태 변경
            </Button>
            {statusModalOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg p-2 z-10">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={contest.status === 'preparing' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('preparing')}
                    className="justify-start"
                    size="sm"
                  >
                    준비중
                  </Button>
                  <Button
                    variant={contest.status === 'in-progress' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('in-progress')}
                    className="justify-start"
                    size="sm"
                  >
                    진행중
                  </Button>
                  <Button
                    variant={contest.status === 'submitted' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('submitted')}
                    className="justify-start"
                    size="sm"
                  >
                    제출완료
                  </Button>
                  <Button
                    variant={contest.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('completed')}
                    className="justify-start"
                    size="sm"
                  >
                    완료
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="sm"
            onClick={() => setTeamModalOpen(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            팀원 관리
          </Button>

          <TeamManagementModal
            isOpen={teamModalOpen}
            onClose={() => setTeamModalOpen(false)}
            teamMembers={teamMembers}
            onAddMember={(member) => {
              // TeamMember 객체를 받아서 처리
              // handleAddUserFromSearch를 사용하여 팀원 추가
              if (handleAddUserFromSearch) {
                handleAddUserFromSearch({
                  id: member.id,
                  display_name: member.name,
                  email: member.email || '',
                  avatar_url: member.avatar_url
                });
              }
            }}
            onRemoveMember={handleRemoveTeamMember}
            onUpdateMember={() => {}}
          />

          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="sm"
            onClick={() => setScheduleModalOpen(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            일정 관리
          </Button>

          <ScheduleManagementModal
            open={scheduleModalOpen}
            onOpenChange={setScheduleModalOpen}
            schedules={schedules}
            newSchedule={newSchedule}
            setNewSchedule={setNewSchedule}
            onAddSchedule={handleAddSchedule}
            onRemoveSchedule={handleRemoveSchedule}
          />

          {contest.contest_url && (
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => window.open(contest.contest_url, '_blank')}
            >
              <Users className="h-4 w-4 mr-2" />
              공식 사이트
            </Button>
          )}

          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
            size="sm"
            onClick={async () => {
              const success = await handleDeleteContest();
              if (success) {
                // 삭제 성공 시 홈으로 이동
                window.location.href = '/';
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            공모전 삭제
          </Button>
        </CardContent>
      </Card>

      {/* 팀원 정보 */}
      {teamMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              팀원 ({teamMembers.length}명)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {member.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                    {member.email && (
                      <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 일정 정보 */}
      {schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              일정 ({schedules.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-2 bg-gray-50 rounded">
                  <div className="font-medium text-sm">{schedule.title}</div>
                  <div className="text-xs text-muted-foreground">{schedule.date}</div>
                  {schedule.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {schedule.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 정보 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">정보 요약</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">등록일</span>
            <span>{new Date(contest.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">수정일</span>
            <span>{new Date(contest.updated_at).toLocaleDateString()}</span>
          </div>
          {contest.category && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">카테고리</span>
              <span>{contest.category}</span>
            </div>
          )}
          {contest.team_members_count > 1 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">팀 구성</span>
              <span>{contest.team_members_count}명</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 