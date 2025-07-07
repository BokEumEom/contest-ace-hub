import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, FileText, Upload, Award, AlertTriangle, Calendar, Users, Info, Lightbulb } from 'lucide-react';
import ProgressManager from '@/components/ProgressManager';
import FileManager from '@/components/FileManager';
import AIAssistant from '@/components/AIAssistant';
import { Contest } from '@/types/contest';

interface ContestTabsProps {
  activeTab: string;
  contest: Contest;
  onProgressUpdate: (progress: number) => void;
}

export const ContestTabs: React.FC<ContestTabsProps> = ({
  activeTab,
  contest,
  onProgressUpdate
}) => {
  if (activeTab === 'overview') {
    return (
      <div className="space-y-6">
        {/* 설명 */}
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
        {contest.contestTheme && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-contest-blue" />
                공모 주제
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.contestTheme}</p>
            </CardContent>
          </Card>
        )}

        {/* 진행 상황 관리 */}
        <ProgressManager 
          contestId={contest.id}
          currentProgress={contest.progress}
          onProgressUpdate={onProgressUpdate}
        />

        {/* 파일 관리 */}
        <FileManager contestId={contest.id} />
      </div>
    );
  }

  if (activeTab === 'details') {
    return (
      <div className="space-y-6">
        {contest.submissionFormat && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-contest-coral" />
                출품 규격
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.submissionFormat}</p>
            </CardContent>
          </Card>
        )}

        {contest.submissionMethod && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-contest-light-blue" />
                출품 방법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.submissionMethod}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (activeTab === 'schedule') {
    return (
      <div className="space-y-6">
        {contest.contestSchedule && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-contest-blue" />
                공모 일정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.contestSchedule}</p>
            </CardContent>
          </Card>
        )}

        {contest.resultAnnouncement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-contest-coral" />
                발표 일정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.resultAnnouncement}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (activeTab === 'awards') {
    return (
      <div className="space-y-6">
        {contest.prizeDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-contest-orange" />
                시상 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{contest.prizeDetails}</p>
            </CardContent>
          </Card>
        )}

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
      </div>
    );
  }

  if (activeTab === 'precautions') {
    return (
      <div className="space-y-6">
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

  if (activeTab === 'ai-assistant') {
    return (
      <div className="space-y-6">
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
              contestTheme={contest.contestTheme || ''}
              submissionFormat={contest.submissionFormat || ''}
              submissionMethod={contest.submissionMethod || ''}
              prizeDetails={contest.prizeDetails || ''}
              precautions={contest.precautions || ''}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}; 