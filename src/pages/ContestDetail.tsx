import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Info,
  Lightbulb,
  Target,
  Upload,
  Trophy
} from 'lucide-react';
import Header from '@/components/Header';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { useContestDetail } from '@/hooks/useContestDetail';
import { ContestTabs } from '@/components/contest/ContestTabs';
import { ContestSidebar } from '@/components/contest/ContestSidebar';
import { ContestHeader } from '@/components/contest/ContestHeader';

const ContestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
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
    handleAddUserFromSearch,
    handleAddSchedule,
    handleRemoveSchedule,
    handleDeleteContest,
    openEditModal,
    getStatusColor,
    getStatusText,
    getDaysLeftColor
  } = useContestDetail(id);

  const tabs = [
    { id: 'overview', label: '개요', icon: Info },
    { id: 'progress', label: '진행 상황', icon: Target },
    { id: 'files', label: '작품 관리', icon: Upload },
    { id: 'ai-assistant', label: 'AI 어시스턴트', icon: Lightbulb },
    { id: 'results', label: '결과', icon: Trophy }
  ];

  return (
    <PageTransition isLoading={loading}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!loading && !contest ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">공모전을 찾을 수 없습니다</h2>
              <p className="text-muted-foreground mb-4">요청하신 공모전이 존재하지 않거나 접근 권한이 없습니다.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                홈으로 돌아가기
              </Button>
            </div>
          ) : contest ? (
            <>
              {/* 개선된 헤더 */}
              <ContestHeader
                contest={contest}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getDaysLeftColor={getDaysLeftColor}
              />

              {/* 탭 네비게이션 */}
              <div className="flex space-x-1 border-b mb-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id as any)}
                      className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 메인 콘텐츠 */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 탭 콘텐츠 */}
                  <ContestTabs 
                    activeTab={activeTab}
                    contest={contest}
                    onProgressUpdate={handleProgressUpdate}
                    setActiveTab={setActiveTab}
                  />
                </div>

                {/* 사이드바 */}
                <ContestSidebar
                  contest={contest}
                  teamMembers={teamMembers}
                  schedules={schedules}
                  editModalOpen={editModalOpen}
                  setEditModalOpen={setEditModalOpen}
                  statusModalOpen={statusModalOpen}
                  setStatusModalOpen={setStatusModalOpen}
                  teamModalOpen={teamModalOpen}
                  setTeamModalOpen={setTeamModalOpen}
                  scheduleModalOpen={scheduleModalOpen}
                  setScheduleModalOpen={setScheduleModalOpen}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  newMember={newMember}
                  setNewMember={setNewMember}
                  newSchedule={newSchedule}
                  setNewSchedule={setNewSchedule}
                  handleEditSubmit={handleEditSubmit}
                  handleStatusChange={handleStatusChange}
                  handleAddTeamMember={handleAddTeamMember}
                  handleRemoveTeamMember={handleRemoveTeamMember}
                  handleAddUserFromSearch={handleAddUserFromSearch}
                  handleAddSchedule={handleAddSchedule}
                  handleRemoveSchedule={handleRemoveSchedule}
                  handleDeleteContest={handleDeleteContest}
                  openEditModal={openEditModal}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  getDaysLeftColor={getDaysLeftColor}
                />
              </div>
            </>
          ) : null}
        </main>
      </div>
    </PageTransition>
  );
};

export default ContestDetail;
