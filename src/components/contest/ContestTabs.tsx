import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  FileText, 
  Upload, 
  Award, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Info, 
  Lightbulb,
  Clock,
  Globe,
  Medal,
  Star,
  Settings,
  Plus,
  Trash2,
  Edit,
  X,
  MessageSquare,
  File,
  Download,
  Eye,
  Image,
  Video,
  Music
} from 'lucide-react';
import { useContestDetail } from '@/hooks/useContestDetail';
import { useAuth } from '@/components/AuthProvider';
import ProgressManager from '@/components/ProgressManager';
import FileManager from '@/components/FileManager';
import AIAssistant from '@/components/AIAssistant';
import { ContestResultForm } from './ContestResultForm';
import { Contest } from '@/types/contest';
import { ContestResultService } from '@/services/contestResultService';
import { ContestResultFormData, ContestResult } from '@/types/contest';
import { Badge } from '@/components/ui/badge';
import { FileService, FileItem } from '@/services/fileService';
import { isImageFile, isVideoFile, isAudioFile, getFileTypeColor } from '@/components/FileManager/utils/fileUtils';
import ImageViewerModal from '@/components/FileManager/ImageViewerModal';

interface ContestResultInputProps {
  contestId: number;
  onSave: (results: ContestResult[]) => void;
}

interface ContestResultFormProps {
  contestId: number;
  onSubmit: (result: ContestResultFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ContestTabsProps {
  activeTab: 'overview' | 'progress' | 'files' | 'ai-assistant' | 'results';
  contest: Contest;
  onProgressUpdate: (progress: number) => void;
  setActiveTab: (tab: 'overview' | 'progress' | 'files' | 'ai-assistant' | 'results') => void;
}

export const ContestTabs: React.FC<ContestTabsProps> = ({
  contest,
  activeTab,
  setActiveTab,
  onProgressUpdate
}) => {
  // 실시간으로 남은 일수 계산하는 함수
  const calculateDaysLeft = (deadline: string) => {
    if (!deadline) return 0;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // 결과 저장 핸들러
  const handleSaveResults = async (newResults: ContestResult[]) => {
    try {
      // 실제로는 API 호출로 결과를 저장해야 함
      console.log('Saving results:', newResults);
      alert('결과가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Error saving results:', error);
      alert('결과 저장 중 오류가 발생했습니다.');
    }
  };



  const { updateContest } = useContestDetail(contest.id);
  const { user } = useAuth();
  
  // 디버깅 로그
  console.log('ContestTabs - contest.id:', contest.id);

  // tasks와 progress를 함께 업데이트
  const handleTasksUpdate = (tasks: any, progress: number) => {
    updateContest(parseInt(contest.id), { tasks, progress });
    onProgressUpdate(progress); // 기존 진행률도 갱신
  };

  // 결과 목록 상태
  const [results, setResults] = useState<ContestResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // 파일 정보 상태 추가
  const [fileDetails, setFileDetails] = useState<{ [key: number]: FileItem[] }>({});
  
  // 이미지 뷰어 상태 추가
  const [imageViewerFile, setImageViewerFile] = useState<FileItem | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  // 결과 목록 로드
  const loadResults = async () => {
    setLoadingResults(true);
    try {
      const contestResults = await ContestResultService.getResults(parseInt(contest.id));
      setResults(contestResults);
      
      // 각 결과의 연결된 파일 상세 정보 로드
      const fileDetailsMap: { [key: number]: FileItem[] } = {};
      for (const result of contestResults) {
        if (result.file_ids && result.file_ids.length > 0) {
          try {
            const files = await FileService.getFiles(contest.id);
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
    } finally {
      setLoadingResults(false);
    }
  };

  // 결과 추가 후 목록 새로고침
  const handleAddResult = async (resultData: ContestResultFormData) => {
    try {
      const newResult = await ContestResultService.addResult(parseInt(contest.id), resultData);
      if (newResult) {
        // 결과 목록 새로고침
        await loadResults();
        // 폼 숨기기
        setShowAddForm(false);
        // 성공 피드백 (실제로는 toast나 notification 사용 권장)
        console.log('✅ 결과가 성공적으로 추가되었습니다!');
      }
    } catch (error) {
      console.error('❌ 결과 추가 중 오류 발생:', error);
      // 에러 피드백 (실제로는 toast나 notification 사용 권장)
      alert('결과 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 결과 삭제
  const handleDeleteResult = async (resultId: number) => {
    if (!confirm('정말로 이 결과를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await ContestResultService.deleteResult(resultId);
      // 결과 목록 새로고침
      await loadResults();
      // 성공 피드백
      console.log('✅ 결과가 성공적으로 삭제되었습니다!');
    } catch (error) {
      console.error('❌ 결과 삭제 중 오류 발생:', error);
      // 에러 피드백
      alert('결과 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
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
      setImageViewerFile(file);
      setImageViewerOpen(true);
    } else {
      handleFileDownload(file);
    }
  };

  // 이미지 뷰어 닫기
  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setImageViewerFile(null); // 모달 닫을 때 파일 정보도 초기화
  };

  // 파일 타입별 아이콘 결정
  const getFileIcon = (fileName: string) => {
    if (isImageFile(fileName)) return <Image className="h-4 w-4" />;
    if (isVideoFile(fileName)) return <Video className="h-4 w-4" />;
    if (isAudioFile(fileName)) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // 파일 타입별 색상 결정
  const getFileTypeColor = (fileName: string) => {
    if (isImageFile(fileName)) return 'text-blue-600';
    if (isVideoFile(fileName)) return 'text-purple-600';
    if (isAudioFile(fileName)) return 'text-green-600';
    return 'text-gray-600';
  };

  // 썸네일 렌더링 함수
  const renderThumbnail = (file: FileItem) => {
    if (isImageFile(file.name)) {
      return (
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => handleFileView(file)}>
          <img 
            src={file.url} 
            alt={file.name}
            className="w-16 h-16 object-cover rounded-md border border-gray-200 hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // 이미지 로드 실패 시 아이콘으로 대체
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallbackIcon = document.createElement('div');
                fallbackIcon.className = `w-16 h-16 flex items-center justify-center bg-blue-100 rounded-md border border-gray-200`;
                fallbackIcon.innerHTML = '<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                parent.appendChild(fallbackIcon);
              }
            }}
          />
          {/* 호버 시 확대 아이콘 표시 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
            <Eye className="h-5 w-5 text-white" />
          </div>
        </div>
      );
    }

    if (isVideoFile(file.name)) {
      return (
        <div className="relative flex-shrink-0 cursor-pointer" onClick={() => handleFileView(file)}>
          <div className="w-16 h-16 bg-purple-100 rounded-md border border-gray-200 flex items-center justify-center">
            <Video className="h-6 w-6 text-purple-600" />
          </div>
          {/* 호버 시 재생 아이콘 표시 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
            <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[8px] border-l-purple-600 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      );
    }

    if (isAudioFile(file.name)) {
      return (
        <div className="w-16 h-16 bg-green-100 rounded-md border border-gray-200 flex items-center justify-center">
          <Music className="h-6 w-6 text-green-600" />
        </div>
      );
    }

    // 일반 파일
    return (
      <div className="w-16 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
        <File className="h-6 w-6 text-gray-600" />
      </div>
    );
  };

  // 결과 탭 활성화 시 결과 목록 로드
  useEffect(() => {
    if (activeTab === 'results') {
      loadResults();
    }
  }, [activeTab, contest.id]);

  if (activeTab === 'overview') {
    return (
      <div className="space-y-6">
        {/* 주요 정보 섹션 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">공모전 개요</CardTitle>
                <CardDescription className="text-sm text-blue-600">
                  공모전의 핵심 정보를 확인하세요
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 왼쪽: 핵심 정보 */}
              <div className="space-y-4">
                {/* 공모전 소개 */}
                {contest.description && (
                  <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Info className="h-3 w-3 text-blue-600" />
                        </div>
                        공모전 소개
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed text-gray-700">{contest.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* 공모 주제 */}
                {contest.contest_theme && (
                  <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="h-3 w-3 text-blue-600" />
                        </div>
                        공모 주제
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed text-gray-700">{contest.contest_theme}</p>
                    </CardContent>
                  </Card>
                )}

                {/* 출품 규격 */}
                {contest.submission_format && (
                  <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center">
                          <FileText className="h-3 w-3 text-contest-coral" />
                        </div>
                        출품 규격
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed text-gray-700">{contest.submission_format}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 오른쪽: 상세 정보 */}
              <div className="space-y-4">
                {/* 출품 방법 */}
                {contest.submission_method && (
                  <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="w-6 h-6 bg-light-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="h-3 w-3 text-contest-light-blue" />
                        </div>
                        출품 방법
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed text-gray-700">{contest.submission_method}</p>
                    </CardContent>
                  </Card>
                )}

                {/* 상금/혜택 요약 */}
                {contest.prize && (
                  <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center">
                          <Trophy className="h-3 w-3 text-contest-coral" />
                        </div>
                        상금/혜택 요약
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm font-medium leading-relaxed text-gray-700">{contest.prize}</p>
                    </CardContent>
                  </Card>
                )}

                {/* 시상 내역 */}
                {contest.prize_details && (
                  <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <Award className="h-3 w-3 text-contest-orange" />
                        </div>
                        시상 내역
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed text-gray-700">{contest.prize_details}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 일정 정보 섹션 */}
        {(contest.contest_schedule || contest.result_announcement) && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-teal-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">일정 정보</CardTitle>
                  <CardDescription className="text-sm text-green-600">
                    공모전 일정과 발표 일정을 확인하세요
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contest.contest_schedule && (
                  <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-green-600" />
                        </div>
                        공모 일정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                        {contest.contest_schedule}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {contest.result_announcement && (
                  <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center">
                          <Clock className="h-3 w-3 text-contest-coral" />
                        </div>
                        발표 일정
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                        {contest.result_announcement}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 유의사항 섹션 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                  </div>
                  유의사항
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {contest.precautions ? (
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{contest.precautions}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    등록된 유의사항이 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTab === 'progress') {
    return (
      <div className="space-y-6">
        {/* 진행 상황 개요 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-contest-orange" />
              진행 상황 개요
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-contest-orange">{contest.progress}%</div>
                <div className="text-sm text-muted-foreground">현재 진행률</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-contest-blue">
                  {calculateDaysLeft(contest.deadline)}
                </div>
                <div className="text-sm text-muted-foreground">남은 일수</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-contest-coral">{contest.team_members_count || 0}</div>
                <div className="text-sm text-muted-foreground">팀원 수</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 진행 상황 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-contest-orange" />
              진행률 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressManager 
              contestId={contest.id}
              currentProgress={contest.progress}
              tasks={contest.tasks || []}
              onTasksUpdate={handleTasksUpdate}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTab === 'files') {
    return (
      <div className="space-y-6">
        {/* 작품 관리 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-contest-blue" />
              작품 관리 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-contest-blue mb-2">지원되는 파일 형식</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-1">문서</h5>
                  <p className="text-muted-foreground">PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">이미지</h5>
                  <p className="text-muted-foreground">PNG, JPG, JPEG, GIF, WEBP</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">미디어</h5>
                  <p className="text-muted-foreground">MP4, WEBM, OGG, MP3, WAV</p>
                </div>
                <div>
                  <h5 className="font-medium mb-1">기타</h5>
                  <p className="text-muted-foreground">TXT, CSV</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 작품 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-contest-blue" />
              작품 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 권한 안내 메시지 */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Upload className="h-3 w-3 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">작품 관리 권한</p>
                  <p className="text-blue-700">
                    {(contest as any).user_id === user?.id 
                      ? "이 공모전의 작성자입니다. 모든 파일을 관리할 수 있습니다."
                      : "모든 인증된 사용자가 파일을 업로드할 수 있습니다. 작성자는 모든 파일을 관리할 수 있고, 다른 사용자는 자신이 업로드한 파일만 편집/삭제할 수 있습니다."
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <FileManager contestId={contest.id} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTab === 'ai-assistant') {
    return (
      <div className="space-y-6">
        {/* AI 어시스턴트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-contest-coral" />
              AI 어시스턴트
            </CardTitle>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                현재 공모전 정보를 바탕으로 AI가 아이디어를 생성하고 문서를 검토해드립니다.
              </p>
            </CardContent>
          </CardHeader>
          <CardContent>
            <AIAssistant 
              contestTitle={contest.title}
              contestDescription={contest.description || ''}
              contestTheme={contest.contest_theme || ''}
              submissionFormat={contest.submission_format || ''}
              submissionMethod={contest.submission_method || ''}
              prizeDetails={contest.prize_details || ''}
              precautions={contest.precautions || ''}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTab === 'results') {
    return (
      <div className="space-y-6">
        {/* 결과 관리 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              결과 관리
            </CardTitle>
            <CardDescription>
              공모전 결과를 관리하고 참가자들에게 피드백을 제공하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 권한 확인 및 안내 */}
            {(contest as any).user_id === user?.id ? (
              <div className="space-y-6">
                {/* 결과 추가 버튼 및 상태 표시 */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Trophy className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">결과 관리</h4>
                      <p className="text-sm text-blue-700">
                        {results.length > 0 
                          ? `${results.length}개의 결과가 등록되어 있습니다` 
                          : '아직 등록된 결과가 없습니다'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {results.length > 0 && (
                      <Badge variant="outline" className="bg-white">
                        총 {results.length}개
                      </Badge>
                    )}
                    <Button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={`transition-all duration-200 ${
                        showAddForm 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {showAddForm ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          폼 닫기
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          새 결과 추가
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 결과 추가 폼 (토글) */}
                <div className={`transition-all duration-300 ease-in-out ${
                  showAddForm 
                    ? 'max-h-[2000px] opacity-100' 
                    : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  {showAddForm && (
                    <div className="pt-4">
                      <ContestResultForm
                        contestId={parseInt(contest.id)}
                        onSubmit={handleAddResult}
                        onCancel={() => setShowAddForm(false)}
                        isLoading={false}
                      />
                    </div>
                  )}
                </div>
                
                {/* 기존 결과 목록 */}
                <div className={`transition-all duration-300 ease-in-out ${
                  results.length > 0 ? 'opacity-100' : 'opacity-50'
                }`}>
                  {loadingResults ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground font-medium">결과를 불러오는 중...</p>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">아직 등록된 결과가 없습니다</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        첫 번째 결과를 추가하여 공모전을 완성해보세요
                      </p>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        variant="outline"
                        className="border-gray-400 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        첫 번째 결과 추가
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">등록된 결과</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>총 {results.length}개</span>
                          <span>•</span>
                          <span>최신순</span>
                        </div>
                      </div>
                      
                      {results.map((result, index) => (
                        <Card 
                          key={result.id} 
                          className={`border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200 ${
                            index === 0 ? 'ring-2 ring-blue-100' : ''
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <Badge variant="default" className="bg-blue-600 text-white px-3 py-1">
                                    {result.status}
                                  </Badge>
                                  {result.prize_amount && (
                                    <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                                      🏆 {result.prize_amount}
                                    </Badge>
                                  )}
                                  {index === 0 && (
                                    <Badge variant="outline" className="border-yellow-300 text-yellow-700 bg-yellow-50">
                                      ✨ 최신
                                    </Badge>
                                  )}
                                </div>
                                
                                {result.description && (
                                  <p className="text-gray-700 mb-3 leading-relaxed">{result.description}</p>
                                )}
                                
                                {result.feedback && (
                                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-3">
                                    <p className="text-xs font-medium text-blue-700 mb-2 flex items-center gap-2">
                                      <MessageSquare className="h-3 w-3" />
                                      심사 피드백
                                    </p>
                                    <p className="text-sm text-blue-800 leading-relaxed">{result.feedback}</p>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    발표일: {new Date(result.announcement_date).toLocaleDateString()}
                                  </span>
                                  {result.file_ids && result.file_ids.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <File className="h-3 w-3" />
                                      연결된 파일: {result.file_ids.length}개
                                    </span>
                                  )}
                                </div>
                                
                                {/* 연결된 파일 상세 정보 표시 */}
                                {result.file_ids && result.file_ids.length > 0 && fileDetails[result.id!] && (
                                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                      <File className="h-4 w-4" />
                                      연결된 파일 목록
                                    </h5>
                                    <div className="space-y-2">
                                      {fileDetails[result.id!].map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
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
                                              <div className="text-xs text-muted-foreground">
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
                              
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteResult(result.id!)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  title="결과 삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">
                  결과 관리 권한이 없습니다
                </h4>
                <p className="text-muted-foreground">
                  공모전 작성자만 결과를 관리할 수 있습니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 이미지 뷰어 모달 */}
        <ImageViewerModal
          file={imageViewerFile}
          isOpen={imageViewerOpen}
          onClose={handleCloseImageViewer}
          onDownload={handleFileDownload}
        />
      </div>
    );
  }

  return null;
}; 