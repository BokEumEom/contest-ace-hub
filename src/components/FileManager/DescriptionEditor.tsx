import React, { memo } from 'react';
import { Edit, Save, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DescriptionEditorProps {
  submissionDescription: string;
  setSubmissionDescription: (description: string) => void;
  isEditingDescription: boolean;
  setIsEditingDescription: (editing: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

const DescriptionEditor = memo(({
  submissionDescription,
  setSubmissionDescription,
  isEditingDescription,
  setIsEditingDescription,
  onSave,
  onCancel
}: DescriptionEditorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-contest-blue" />
            작품 설명
          </div>
          {!isEditingDescription ? (
            <Button 
              onClick={() => setIsEditingDescription(true)}
              size="sm"
              className="bg-contest-orange hover:bg-contest-orange/90"
            >
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={onCancel}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
              <Button 
                onClick={onSave}
                size="sm"
                className="bg-contest-orange hover:bg-contest-orange/90"
              >
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditingDescription ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="submission-description">작품 설명</Label>
              <Textarea
                id="submission-description"
                value={submissionDescription}
                onChange={(e) => setSubmissionDescription(e.target.value)}
                placeholder="작품에 대한 설명을 입력하세요. 작품의 제목, 컨셉, 제작 과정, 사용한 재료나 기법, 영감을 준 요소 등을 포함하여 자세히 설명해주세요."
                rows={10}
                className="mt-2"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {submissionDescription ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="whitespace-pre-wrap text-sm">{submissionDescription}</div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">작품 설명이 입력되지 않았습니다.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  "편집" 버튼을 클릭하여 작품 설명을 작성해보세요.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DescriptionEditor.displayName = 'DescriptionEditor';

export default DescriptionEditor; 