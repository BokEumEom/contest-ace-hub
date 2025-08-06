import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { ContestFormProps } from './types';
import { useContestForm } from './hooks/useContestForm';
import { AIInputSection } from './components/AIInputSection';
import {
  BasicInfoSection,
  DetailedInfoSection,
  ScheduleProcedureSection,
  PrizePrecautionsSection
} from './components/FormSections';

const ContestForm: React.FC<ContestFormProps> = ({ onSuccess, onCancel }) => {
  const {
    formData,
    aiState,
    handleChange,
    handleSubmit,
    handleExtractFromUrl,
    handleExtractFromText,
    handleMethodChange,
    updateAIState
  } = useContestForm(onSuccess);

  return (
    <div className="space-y-6">
      {/* AI 기반 등록 섹션 */}
      {aiState.showUrlSection && (
        <AIInputSection
          aiState={aiState}
          onMethodChange={handleMethodChange}
          onUrlInputChange={(value) => updateAIState({ urlInput: value })}
          onTextInputChange={(value) => updateAIState({ textInput: value })}
          onExtractFromUrl={handleExtractFromUrl}
          onExtractFromText={handleExtractFromText}
        />
      )}

      {/* 수동 입력 폼 */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-contest-orange" />
            {aiState.showUrlSection ? '수동 입력' : '공모전 정보 확인'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 기본 정보 섹션 */}
            <BasicInfoSection
              formData={formData}
              onFieldChange={handleChange}
            />

            {/* 공모전 상세 정보 섹션 */}
            <DetailedInfoSection
              formData={formData}
              onFieldChange={handleChange}
            />

            {/* 일정 및 절차 섹션 */}
            <ScheduleProcedureSection
              formData={formData}
              onFieldChange={handleChange}
            />

            {/* 상금 및 주의사항 섹션 */}
            <PrizePrecautionsSection
              formData={formData}
              onFieldChange={handleChange}
            />

            {/* 버튼 섹션 */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                취소
              </Button>
              <Button type="submit" className="flex-1 contest-button-primary">
                공모전 등록
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContestForm; 