import React from 'react';
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
  Settings
} from 'lucide-react';
import { useContestDetail } from '@/hooks/useContestDetail';
import { useAuth } from '@/components/AuthProvider';
import ProgressManager from '@/components/ProgressManager';
import FileManager from '@/components/FileManager';
import AIAssistant from '@/components/AIAssistant';
import { ContestResultInput } from './ContestResultInput';
import { Contest } from '@/types/contest';

interface ContestResult {
  id: string;
  teamName: string;
  projectTitle: string;
  description: string;
  status: string;
  rank?: number;
  score?: number;
  prizeAmount?: string;
  feedback?: string;
  announcementDate: string;
}

interface ContestTabsProps {
  activeTab: 'overview' | 'progress' | 'files' | 'ai-assistant' | 'results';
  contest: Contest;
  onProgressUpdate: (progress: number) => void;
  setActiveTab: (tab: 'overview' | 'progress' | 'files' | 'ai-assistant' | 'results') => void;
}

export const ContestTabs: React.FC<ContestTabsProps> = ({
  activeTab,
  contest,
  onProgressUpdate,
  setActiveTab
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

  // tasks와 progress를 함께 업데이트
  const handleTasksUpdate = (tasks: any, progress: number) => {
    updateContest(parseInt(contest.id), { tasks, progress });
    onProgressUpdate(progress); // 기존 진행률도 갱신
  };

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
                      : "이 공모전의 파일을 조회할 수 있습니다. 편집은 작성자만 가능합니다."
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
              <Settings className="h-5 w-5 text-contest-orange" />
              결과 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContestResultInput
              contestId={contest.id}
              onSave={handleSaveResults}
              existingResults={[]}
              isLoading={false}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}; 