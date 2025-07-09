import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  if (activeTab === 'overview') {
    return (
      <div className="space-y-6">
        {/* 공모전 소개 */}
        {contest.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-contest-blue" />
                공모전 소개
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.description}</p>
            </CardContent>
          </Card>
        )}

        {/* 공모 주제 */}
        {contest.contest_theme && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-contest-blue" />
                공모 주제
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.contest_theme}</p>
            </CardContent>
          </Card>
        )}

        {/* 출품 규격 */}
        {contest.submission_format && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-contest-coral" />
                출품 규격
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.submission_format}</p>
            </CardContent>
          </Card>
        )}

        {/* 출품 방법 */}
        {contest.submission_method && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-contest-light-blue" />
                출품 방법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.submission_method}</p>
            </CardContent>
          </Card>
        )}

        {/* 공모 일정 */}
        {contest.contest_schedule && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-contest-blue" />
                공모 일정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.contest_schedule}</p>
            </CardContent>
          </Card>
        )}

        {/* 발표 일정 */}
        {contest.result_announcement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-contest-coral" />
                발표 일정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.result_announcement}</p>
            </CardContent>
          </Card>
        )}

        {/* 시상 내역 */}
        {contest.prize_details && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-contest-orange" />
                시상 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.prize_details}</p>
            </CardContent>
          </Card>
        )}

        {/* 상금/혜택 요약 */}
        {contest.prize && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-contest-coral" />
                상금/혜택 요약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{contest.prize}</p>
            </CardContent>
          </Card>
        )}

        {/* 유의사항 */}
        {contest.precautions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                유의사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.precautions}</p>
            </CardContent>
          </Card>
        )}

        {!contest.precautions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                유의사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                등록된 유의사항이 없습니다.
              </p>
            </CardContent>
          </Card>
        )}


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
              onProgressUpdate={onProgressUpdate}
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