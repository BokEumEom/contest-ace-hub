import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  Trash2, 
  Upload, 
  Download, 
  Eye, 
  File, 
  Image, 
  Video, 
  Music,
  X,
  Plus,
  Calendar,
  Users,
  Clock,
  Trophy,
  AlertCircle,
  Info,
  Lightbulb,
  Globe,
  Target,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContestDetail } from '@/hooks/useContestDetail';
import { useFileManager } from '@/components/FileManager/hooks/useFileManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabase';
import { FileItem } from '@/services/fileService';
import { useAuth } from '@/components/AuthProvider';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ContestResultService } from '@/services/contestResultService';
import { ContestResult, ContestResultFormData } from '@/types/contest';
import { FileService } from '@/services/fileService';
import { isImageFile, isVideoFile, isAudioFile } from '@/components/FileManager/utils/fileUtils';
import ImageViewerModal from '@/components/FileManager/ImageViewerModal';

const MobileContestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // 상태 관리
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerFile, setImageViewerFile] = useState<FileItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);

  // 결과 목록 상태
  const [results, setResults] = useState<ContestResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  
  // 파일 정보 상태 추가
  const [fileDetails, setFileDetails] = useState<{ [key: number]: FileItem[] }>({});

  // 이미지 뷰어 상태 추가 (기존 imageViewerFile, imageViewerOpen과 구분)
  const [resultImageViewerFile, setResultImageViewerFile] = useState<FileItem | null>(null);
  const [resultImageViewerOpen, setResultImageViewerOpen] = useState(false);

  // 현재 사용자 정보 로드
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    loadCurrentUser();
  }, []);

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
    getDaysLeftColor,
    results: contestResults, // 이 부분은 원래 컴포넌트에서 사용하는 results와 중복되므로 변경
    newResult,
    setNewResult,
    handleAddResult,
    handleDeleteResult
  } = useContestDetail(id);

  // 소유자 권한 확인
  useEffect(() => {
    if (contest && currentUser) {
      setIsOwner(currentUser.id === contest.user_id);
    }
  }, [contest, currentUser]);

  // contest 데이터가 로드될 때 showActions 초기화
  useEffect(() => {
    if (contest && !loading) {
      setShowActions(false);
    }
  }, [contest, loading]);

  // contest 데이터가 로드될 때 결과 목록 로드
  useEffect(() => {
    if (contest && !loading) {
      loadResults();
    }
  }, [contest, loading]);

  // 파일 관리 훅 사용
  const {
    files,
    loading: filesLoading,
    handleFilesUpload,
    deleteFile,
    downloadFile,
    viewFile,
    // 삭제 다이얼로그 관련 추가
    deleteDialogOpen,
    fileToDelete,
    closeDeleteDialog,
    executeDelete
  } = useFileManager(id || '');

  // 결과 목록 로드
  const loadResults = async () => {
    if (!contest?.id) return;
    
    setLoadingResults(true);
    try {
      const contestResults = await ContestResultService.getResults(contest.id);
      setResults(contestResults);
      
      // 각 결과의 연결된 파일 상세 정보 로드
      const fileDetailsMap: { [key: number]: FileItem[] } = {};
      for (const result of contestResults) {
        if (result.file_ids && result.file_ids.length > 0) {
          try {
            const files = await FileService.getFiles(contest.id.toString());
            const resultFiles = files.filter(file => 
              result.file_ids!.includes(file.id!)
            );
            fileDetailsMap[result.id!] = resultFiles;
          } catch (error) {
            console.error('Error loading file details for result:', result.id, error);
            fileDetailsMap[result.id!] = [];
          }
        }
      }
      setFileDetails(fileDetailsMap);
    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // 파일 다운로드 핸들러
  const handleFileDownload = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 파일 보기 핸들러 수정
  const handleFileView = (file: FileItem) => {
    if (isImageFile(file.name) || isVideoFile(file.name)) {
      setResultImageViewerFile(file);
      setResultImageViewerOpen(true);
    } else {
      handleFileDownload(file);
    }
  };

  // 이미지 뷰어 닫기
  const handleCloseResultImageViewer = () => {
    setResultImageViewerOpen(false);
    setResultImageViewerFile(null);
  };

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleEdit = useCallback(async () => {
    try {
      await openEditModal();
      // 편집 모달이 열렸는지 확인
      if (!editModalOpen) {
        console.warn('편집 모달을 열 수 없습니다.');
      }
    } catch (error) {
      console.error('편집 모달 열기 실패:', error);
    }
  }, [openEditModal, editModalOpen]);

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

  // 파일 타입별 아이콘 결정
  const getFileIcon = (fileName: string) => {
    if (isImageFile(fileName)) return <Image className="h-4 w-4" />;
    if (isVideoFile(fileName)) return <Video className="h-4 w-4" />;
    if (isAudioFile(fileName)) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // 썸네일 렌더링 함수
  const renderThumbnail = (file: FileItem) => {
    if (isImageFile(file.name)) {
      return (
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => handleFileView(file)}>
          <img 
            src={file.url} 
            alt={file.name}
            className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // 이미지 로드 실패 시 아이콘으로 대체
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallbackIcon = document.createElement('div');
                fallbackIcon.className = `w-16 h-16 flex items-center justify-center bg-blue-100 rounded-lg border border-gray-200`;
                fallbackIcon.innerHTML = '<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                parent.appendChild(fallbackIcon);
              }
            }}
          />
          {/* 호버 시 확대 아이콘 표시 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
            <Eye className="h-5 w-5 text-white" />
          </div>
        </div>
      );
    }

    if (isVideoFile(file.name)) {
      return (
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => handleFileView(file)}>
          <div className="w-16 h-16 bg-purple-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <Video className="h-6 w-6 text-purple-600" />
          </div>
          {/* 호버 시 재생 아이콘 표시 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
            <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[8px] border-l-purple-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      );
    }

    if (isAudioFile(file.name)) {
      return (
        <div className="w-16 h-16 bg-green-100 rounded-lg border border-gray-200 flex items-center justify-center">
          <Music className="h-6 w-6 text-green-600" />
        </div>
      );
    }

    // 일반 파일
    return (
      <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        <File className="h-6 w-6 text-gray-600" />
      </div>
    );
  };

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
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
              className="h-12 w-12 -ml-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>

            {/* 제목 */}
            <h1 className="text-lg font-semibold text-gray-900 truncate flex-1 mx-4">
              {contest.title}
            </h1>

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-2">
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setShowActions(true)}
                >
                  <Edit className="h-6 w-6" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12"
                onClick={() => setShowActions(true)}
              >
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 컨텐츠 영역 */}
      <div className="pb-20">
        {/* 공모전 정보 카드 */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="space-y-4">
            {/* 상태 및 마감일 */}
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(contest.status)} px-3 py-1.5 text-sm font-medium`}>
                {getStatusText(contest.status)}
              </Badge>
              <div className={`text-sm font-bold px-4 py-2 rounded-full ${getDaysLeftColor(contest.days_left)}`}>
                {contest.days_left > 0 ? `D-${contest.days_left}` : '마감'}
              </div>
            </div>

            {/* 진행률 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">진행률</span>
                <span className="font-bold text-lg">{contest.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-contest-gradient h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${contest.progress || 0}%` }}
                />
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">마감일</p>
                  <p className="text-sm font-semibold text-gray-900">{contest.deadline || '미정'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">팀원</p>
                  <p className="text-sm font-semibold text-gray-900">{contest.team_members_count || 0}명</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 스크롤 컨텐츠 */}
        <div className="space-y-6 p-6">
          {/* 공모전 개요 섹션 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-contest-orange bg-opacity-10 rounded-lg">
                <Info className="h-6 w-6 text-contest-orange" />
              </div>
              공모전 개요
            </h3>

            {/* 공모전 주제 */}
            {contest.contest_theme && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Lightbulb className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-purple-900 mb-2 text-lg">공모주제</h4>
                    <p className="text-purple-800 leading-relaxed">{contest.contest_theme}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 조직 정보 */}
            {contest.organization && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">주최기관</h4>
                </div>
                <p className="text-gray-700 text-lg font-medium">{contest.organization}</p>
              </div>
            )}

            {/* 설명 */}
            {contest.description && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-3 text-lg">공모전 소개</h4>
                <p className="text-gray-700 leading-relaxed text-base">{contest.description}</p>
              </div>
            )}
          </div>

          {/* AI 어시스턴트 섹션 */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
              </div>
              AI 어시스턴트
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
              <p className="text-gray-700 mb-4 text-base leading-relaxed">
                AI를 활용하여 공모전 준비를 도와드립니다. 아이디어 구상부터 제출까지 모든 과정을 지원합니다.
              </p>
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                <Lightbulb className="h-5 w-5 mr-2" />
                AI와 대화하기
              </Button>
            </div>
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
                                          {getFileIcon(file.name)}
                                        </div>
                                      </div>
                                      {/* 삭제 버튼 (호버 시 표시) */}
                                      {file.canDelete && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // 커스텀 다이얼로그 사용
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
                                        {getFileIcon(file.name)}
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
                                            onClick={() => {
                                              // 커스텀 다이얼로그 사용
                                              deleteFile(file.id!);
                                            }}
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

          {/* 결과 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                결과
              </h3>
              {isOwner && (
                <Button
                  size="sm"
                  onClick={() => setShowResultForm(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  결과 추가
                </Button>
              )}
            </div>
            
            {/* 결과 목록 */}
            {loadingResults ? (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-contest-orange mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">결과 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={result.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-blue-600 text-white text-xs px-3 py-1.5 font-medium">
                          {result.status}
                        </Badge>
                        {result.prize_amount && (
                          <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50 text-xs px-3 py-1.5 font-medium">
                            🏆 {result.prize_amount}
                          </Badge>
                        )}
                        {index === 0 && (
                          <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50 text-xs px-3 py-1.5 font-medium">
                            ✨ 최신
                          </Badge>
                        )}
                      </div>
                      
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResult(result.id!)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-10 w-10 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {result.description && (
                      <p className="text-gray-700 mb-4 leading-relaxed text-base">{result.description}</p>
                    )}
                    
                    {result.feedback && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-4">
                        <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          심사 피드백
                        </p>
                        <p className="text-blue-800 leading-relaxed text-sm">{result.feedback}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{new Date(result.announcement_date).toLocaleDateString()}</span>
                      </span>
                      {result.file_ids && result.file_ids.length > 0 && (
                        <span className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span className="font-medium">파일 {result.file_ids.length}개</span>
                        </span>
                      )}
                    </div>
                    
                    {/* 연결된 파일 상세 정보 표시 */}
                    {result.file_ids && result.file_ids.length > 0 && fileDetails[result.id!] && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <File className="h-4 w-4" />
                          연결된 파일 목록
                        </h5>
                        <div className="space-y-3">
                          {fileDetails[result.id!].map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* 썸네일 표시 */}
                                {renderThumbnail(file)}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm truncate" title={file.name}>
                                      {file.name}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {file.type}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {FileService.formatFileSize(file.size)} • {file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileView(file)}
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="파일 보기"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileDownload(file)}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="파일 다운로드"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center border border-gray-200">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  {isOwner ? '아직 등록된 결과가 없습니다' : '결과가 발표되지 않았습니다'}
                </h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {isOwner 
                    ? '공모전 결과를 추가하여 참가자들에게 피드백을 제공하세요'
                    : '결과가 발표되면 여기에 표시됩니다'
                  }
                </p>
                {isOwner && (
                  <Button
                    onClick={() => setShowResultForm(true)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    첫 번째 결과 추가
                  </Button>
                )}
              </div>
            )}
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
              {isOwner && (
                <button
                  onClick={handleEdit}
                  className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Edit className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">편집</span>
                  </div>
                </button>
              )}
              <button
                onClick={handleShare}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-gray-600" />
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
                          {getFileIcon(file.name)}
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

      {/* 결과 이미지 뷰어 모달 */}
      <ImageViewerModal
        file={resultImageViewerFile}
        isOpen={resultImageViewerOpen}
        onClose={handleCloseResultImageViewer}
        onDownload={handleFileDownload}
      />

      {/* 파일 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={executeDelete}
        title="파일 삭제"
        description={fileToDelete ? `"${fileToDelete.name}" 파일을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.` : ''}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
      />

      {/* 결과 추가 폼 모달 */}
      {showResultForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">결과 추가</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowResultForm(false)}
                className="h-10 w-10 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-5">
              {/* 결과 상태 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  결과 상태 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newResult.status}
                  onChange={(e) => setNewResult({ ...newResult, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base transition-all duration-200"
                  placeholder="예: 1등상, 특별상, 최종선정"
                />
              </div>
              
              {/* 상금 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  상금
                </label>
                <input
                  type="text"
                  value={newResult.prize_amount}
                  onChange={(e) => setNewResult({ ...newResult, prize_amount: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base transition-all duration-200"
                  placeholder="예: 100만원 또는 특별상"
                />
              </div>
              
              {/* 발표일 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  발표일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newResult.announcement_date}
                  onChange={(e) => setNewResult({ ...newResult, announcement_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base transition-all duration-200"
                />
              </div>
              
              {/* 설명 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  설명
                </label>
                <textarea
                  value={newResult.description}
                  onChange={(e) => setNewResult({ ...newResult, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base transition-all duration-200 resize-none"
                  placeholder="결과에 대한 설명"
                  rows={3}
                />
              </div>
              
              {/* 피드백 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  심사 피드백
                </label>
                <textarea
                  value={newResult.feedback}
                  onChange={(e) => setNewResult({ ...newResult, feedback: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-base transition-all duration-200 resize-none"
                  placeholder="참가자에게 전달할 피드백"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-6">
                <Button
                  onClick={handleAddResult}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  disabled={!newResult.status || !newResult.announcement_date}
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  결과 추가
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResultForm(false)}
                  className="flex-1 py-3 text-base font-medium border-2 border-gray-200 hover:border-gray-300 rounded-xl"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
          
          {/* 배경 클릭으로 닫기 */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setShowResultForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default MobileContestDetail; 