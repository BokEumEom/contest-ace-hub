import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Share, 
  Trash2, 
  Calendar, 
  Users, 
  Target, 
  Upload, 
  Lightbulb, 
  Trophy,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Award,
  Globe,
  Info,
  Plus,
  X,
  Download,
  Eye,
  Image,
  File,
  Video,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContestDetail } from '@/hooks/useContestDetail';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/AuthProvider';
import { useFileManager } from '@/components/FileManager/hooks/useFileManager';
import { FileItem } from '@/services/fileService';

const MobileContestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [showActions, setShowActions] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageViewerFile, setImageViewerFile] = useState<FileItem | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

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

  // 파일 관리 훅 사용
  const {
    files,
    loading: filesLoading,
    handleFilesUpload,
    deleteFile,
    downloadFile,
    viewFile
  } = useFileManager(id || '');

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleEdit = useCallback(() => {
    openEditModal();
  }, [openEditModal]);

  const handleShare = useCallback(() => {
    // 공유 기능 구현
    if (navigator.share && contest) {
      navigator.share({
        title: contest.title,
        text: `${contest.title} - ${contest.organization}`,
        url: window.location.href,
      });
    }
  }, [contest]);

  const handleDelete = useCallback(() => {
    if (contest && confirm('정말로 이 공모전을 삭제하시겠습니까?')) {
      handleDeleteContest();
      navigate('/');
    }
  }, [contest, handleDeleteContest, navigate]);

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async () => {
    if (selectedFiles.length > 0) {
      await handleFilesUpload(selectedFiles);
      setSelectedFiles([]);
      setShowFileUpload(false);
    }
  }, [selectedFiles, handleFilesUpload]);

  // 파일 선택 처리
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  }, []);

  // 파일 아이콘 가져오기
  const getFileIcon = useCallback((file: FileItem) => {
    const extension = file.name.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac'];

    if (imageExtensions.includes(extension || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (videoExtensions.includes(extension || '')) {
      return <Video className="h-5 w-5 text-purple-500" />;
    } else if (audioExtensions.includes(extension || '')) {
      return <Music className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  }, []);

  // 파일 크기 포맷팅
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // 이미지 뷰어 열기
  const openImageViewer = useCallback((file: FileItem) => {
    setImageViewerFile(file);
    setImageViewerOpen(true);
  }, []);

  // 이미지 뷰어 닫기
  const closeImageViewer = useCallback(() => {
    setImageViewerOpen(false);
    setImageViewerFile(null);
  }, []);

  if (!isMobile) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-contest-orange mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">공모전을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 공모전이 존재하지 않거나 접근 권한이 없습니다.</p>
          <Button onClick={handleBack} className="bg-contest-gradient text-white">
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* 뒤로가기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* 제목 */}
            <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 mx-4">
              {contest.title}
            </h1>

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={handleEdit}
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={handleShare}
              >
                <Share className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setShowActions(!showActions)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 컨텐츠 영역 */}
      <div className="pb-20">
        {/* 공모전 정보 카드 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="space-y-3">
            {/* 상태 및 마감일 */}
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(contest.status)}>
                {getStatusText(contest.status)}
              </Badge>
              <div className={`text-sm font-bold px-3 py-1 rounded-full ${getDaysLeftColor(contest.days_left)}`}>
                {contest.days_left > 0 ? `D-${contest.days_left}` : '마감'}
              </div>
            </div>

            {/* 진행률 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">진행률</span>
                <span className="font-medium">{contest.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-contest-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${contest.progress || 0}%` }}
                />
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{contest.deadline || '미정'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{contest.team_members_count || 0}명</span>
              </div>
            </div>
          </div>
        </div>

        {/* 스크롤 컨텐츠 */}
        <div className="space-y-6 p-4">
          {/* 공모전 개요 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Info className="h-5 w-5 text-contest-orange" />
              공모전 개요
            </h3>

            {/* 공모전 주제 */}
            {contest.contest_theme && (
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-1">공모주제</h4>
                    <p className="text-sm text-purple-700">{contest.contest_theme}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 조직 정보 */}
            {contest.organization && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">주최기관</h4>
                </div>
                <p className="text-sm text-gray-600">{contest.organization}</p>
              </div>
            )}

            {/* 카테고리 */}
            {contest.category && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">카테고리</h4>
                <Badge variant="outline">{contest.category}</Badge>
              </div>
            )}

            {/* 설명 */}
            {contest.description && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">공모전 소개</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{contest.description}</p>
              </div>
            )}
          </div>

          {/* 진행 상황 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-contest-orange" />
              진행 상황
            </h3>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">전체 진행률</span>
                  <span className="font-medium">{contest.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-contest-gradient h-3 rounded-full transition-all duration-300"
                    style={{ width: `${contest.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 팀원 정보 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">팀원 ({teamMembers.length}명)</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTeamModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </Button>
              </div>
              {teamMembers.length > 0 ? (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-600">{member.role}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTeamMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  팀원이 없습니다. 팀원을 추가해보세요.
                </p>
              )}
            </div>

            {/* 일정 정보 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">일정 ({schedules.length}개)</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScheduleModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </Button>
              </div>
              {schedules.length > 0 ? (
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{schedule.title}</p>
                          <p className="text-xs text-gray-600">{schedule.date}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSchedule(schedule.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {schedule.description && (
                        <p className="text-xs text-gray-600 mt-1">{schedule.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  일정이 없습니다. 일정을 추가해보세요.
                </p>
              )}
            </div>
          </div>

          {/* 파일 관리 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="h-5 w-5 text-contest-orange" />
              파일 관리 ({files.length}개)
            </h3>
            
            {filesLoading ? (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-contest-orange mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">파일 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                {files.length > 0 ? (
                  <div className="space-y-4">
                    {/* 이미지 파일들 - 슬라이드 카드 */}
                    {(() => {
                      const imageFiles = files.filter(file => {
                        const isImage = file.type === 'image' || 
                          ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(
                            file.name.toLowerCase().split('.').pop() || ''
                          );
                        return isImage;
                      });
                      
                      const otherFiles = files.filter(file => {
                        const isImage = file.type === 'image' || 
                          ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(
                            file.name.toLowerCase().split('.').pop() || ''
                          );
                        return !isImage;
                      });

                      return (
                        <>
                          {/* 이미지 슬라이드 카드 */}
                          {imageFiles.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="file-section-title">이미지 ({imageFiles.length}개)</h4>
                                {imageFiles.some(file => file.canDelete) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // 이미지 삭제 모달 또는 기능
                                    }}
                                    className="text-xs"
                                  >
                                    관리
                                  </Button>
                                )}
                              </div>
                              <div className="image-slide-container">
                                <div className="image-slide-wrapper">
                                  {imageFiles.map((file) => (
                                    <div key={file.id} className="relative group">
                                      <div 
                                        className="image-card group"
                                        onClick={() => openImageViewer(file)}
                                      >
                                        <img
                                          src={file.url}
                                          alt={file.name}
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                        <div className="hidden w-full h-full flex items-center justify-center">
                                          {getFileIcon(file)}
                                        </div>
                                      </div>
                                      {/* 삭제 버튼 (호버 시 표시) */}
                                      {file.canDelete && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFile(file.id!);
                                          }}
                                          className="image-delete-button"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 다른 파일들 */}
                          {otherFiles.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="file-section-title">문서 ({otherFiles.length}개)</h4>
                              <div className="space-y-2">
                                {otherFiles.map((file) => (
                                  <div key={file.id} className="file-item">
                                    <div className="file-info">
                                      <div className="file-icon-container">
                                        {getFileIcon(file)}
                                      </div>
                                      <div className="file-details">
                                        <p className="file-name">{file.name}</p>
                                        <p className="file-size">{formatFileSize(file.size)}</p>
                                      </div>
                                      <div className="file-actions">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => viewFile(file)}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => downloadFile(file)}
                                        >
                                          <Download className="h-4 w-4" />
                                        </Button>
                                        {file.canDelete && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => deleteFile(file.id!)}
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">
                      업로드된 파일이 없습니다.
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={() => setShowFileUpload(true)}
                  className="w-full mt-4 bg-contest-gradient text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  파일 업로드
                </Button>
              </div>
            )}
          </div>

          {/* AI 어시스턴트 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-contest-orange" />
              AI 어시스턴트
            </h3>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-4">
                AI를 활용하여 공모전 준비를 도와드립니다.
              </p>
              <Button className="w-full bg-contest-gradient text-white">
                <Lightbulb className="h-4 w-4 mr-2" />
                AI와 대화하기
              </Button>
            </div>
          </div>

          {/* 결과 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-contest-orange" />
              결과
            </h3>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600">
                공모전 결과가 발표되면 여기에 표시됩니다.
              </p>
            </div>
          </div>

          {/* 하단 여백 */}
          <div className="h-4"></div>
        </div>
      </div>

      {/* 액션 메뉴 */}
      {showActions && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4">
            <div className="space-y-2">
              <button
                onClick={handleEdit}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Edit className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">편집</span>
                </div>
              </button>
              <button
                onClick={handleShare}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Share className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">공유</span>
                </div>
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5" />
                  <span className="font-medium">삭제</span>
                </div>
              </button>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowActions(false)}
            >
              취소
            </Button>
          </div>
          
          {/* 배경 클릭으로 닫기 */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setShowActions(false)}
          />
        </div>
      )}

      {/* 팀원 추가 모달 */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">팀원 추가</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTeamModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-contest-orange"
                  placeholder="팀원 이름"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할
                </label>
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-contest-orange"
                  placeholder="역할 (예: 디자이너, 개발자)"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleAddTeamMember}
                  className="flex-1 bg-contest-gradient text-white"
                  disabled={!newMember.name || !newMember.role}
                >
                  추가
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTeamModalOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
          
          {/* 배경 클릭으로 닫기 */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setTeamModalOpen(false)}
          />
        </div>
      )}

      {/* 일정 추가 모달 */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">일정 추가</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setScheduleModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-contest-orange"
                  placeholder="일정 제목"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜
                </label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-contest-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-contest-orange"
                  placeholder="일정에 대한 설명"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleAddSchedule}
                  className="flex-1 bg-contest-gradient text-white"
                  disabled={!newSchedule.title || !newSchedule.date}
                >
                  추가
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setScheduleModalOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
          
          {/* 배경 클릭으로 닫기 */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setScheduleModalOpen(false)}
          />
        </div>
      )}

      {/* 파일 업로드 모달 */}
      {showFileUpload && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">파일 업로드</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFileUpload(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  파일 선택
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-contest-orange"
                />
              </div>
              
              {selectedFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선택된 파일 ({selectedFiles.length}개)
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getFileIcon({ name: file.name, size: file.size } as FileItem)}
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleFileUpload}
                  className="flex-1 bg-contest-gradient text-white"
                  disabled={selectedFiles.length === 0}
                >
                  업로드
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFileUpload(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
          
          {/* 배경 클릭으로 닫기 */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setShowFileUpload(false)}
          />
        </div>
      )}

      {/* 이미지 뷰어 모달 */}
      {imageViewerOpen && imageViewerFile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 배경 클릭으로 닫기 */}
            <div 
              className="absolute inset-0"
              onClick={closeImageViewer}
            />
            
            {/* 이미지 */}
            <img
              src={imageViewerFile.url}
              alt={imageViewerFile.name}
              className="max-w-full max-h-full object-contain z-10"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeImageViewer}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-70 z-20"
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* 파일명 (하단) */}
            <div className="absolute bottom-4 left-4 right-4 text-center z-20">
              <p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full inline-block">
                {imageViewerFile.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileContestDetail; 