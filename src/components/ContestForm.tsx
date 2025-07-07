
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Trophy, FileText } from 'lucide-react';
import { Contest } from '@/types/contest';
import { useContests } from '@/hooks/useContests';
import { toast } from 'sonner';

interface ContestFormProps {
  onSuccess?: (contest: Contest) => void;
  onCancel?: () => void;
}

const ContestForm: React.FC<ContestFormProps> = ({ onSuccess, onCancel }) => {
  const { addContest } = useContests();
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    deadline: '',
    category: '',
    prize: '',
    description: '',
    teamMembers: 1,
    contestTheme: '',
    submissionFormat: '',
    contestSchedule: '',
    submissionMethod: '',
    prizeDetails: '',
    resultAnnouncement: '',
    precautions: '',
    contestUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.organization || !formData.deadline) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const newContest = addContest({
      ...formData,
      status: 'preparing' as const,
      daysLeft,
      progress: 0,
    });

    toast.success('새 공모전이 등록되었습니다!');
    onSuccess?.(newContest);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-contest-orange" />
          새 공모전 등록
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">기본 정보</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">공모전 제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="예: 2024 스마트시티 아이디어 공모전"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contestUrl">공모전 URL</Label>
              <Input
                id="contestUrl"
                value={formData.contestUrl}
                onChange={(e) => handleChange('contestUrl', e.target.value)}
                placeholder="예: https://contest.example.com"
                type="url"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">주최기관 *</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                placeholder="예: 과학기술정보통신부"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="예: IT/기술"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">마감일 *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prize">상금/혜택</Label>
              <Input
                id="prize"
                value={formData.prize}
                onChange={(e) => handleChange('prize', e.target.value)}
                placeholder="예: 대상 500만원"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamMembers">팀원 수</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="teamMembers"
                type="number"
                min="1"
                max="20"
                value={formData.teamMembers}
                onChange={(e) => handleChange('teamMembers', parseInt(e.target.value))}
                className="pl-10"
              />
            </div>
          </div>

          {/* 공모전 상세 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">공모전 상세 정보</h3>
            
            <div className="space-y-2">
              <Label htmlFor="contestTheme">공모 주제</Label>
              <Textarea
                id="contestTheme"
                value={formData.contestTheme}
                onChange={(e) => handleChange('contestTheme', e.target.value)}
                placeholder="공모전의 주제와 목적을 상세히 입력하세요..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionFormat">출품 규격</Label>
              <Textarea
                id="submissionFormat"
                value={formData.submissionFormat}
                onChange={(e) => handleChange('submissionFormat', e.target.value)}
                placeholder="출품작의 형식, 크기, 파일 형태, 페이지 수 등의 규격을 입력하세요..."
                rows={3}
              />
            </div>
          </div>

          {/* 일정 및 절차 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">일정 및 절차</h3>
            
            <div className="space-y-2">
              <Label htmlFor="contestSchedule">공모 일정</Label>
              <Textarea
                id="contestSchedule"
                value={formData.contestSchedule}
                onChange={(e) => handleChange('contestSchedule', e.target.value)}
                placeholder="접수 기간, 심사 일정, 발표 일정 등 전체 일정을 입력하세요..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionMethod">출품 방법</Label>
              <Textarea
                id="submissionMethod"
                value={formData.submissionMethod}
                onChange={(e) => handleChange('submissionMethod', e.target.value)}
                placeholder="출품 접수 방법, 제출 경로, 필요 서류 등을 입력하세요..."
                rows={3}
              />
            </div>
          </div>

          {/* 시상 및 결과 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">시상 및 결과</h3>
            
            <div className="space-y-2">
              <Label htmlFor="prizeDetails">시상 내역</Label>
              <Textarea
                id="prizeDetails"
                value={formData.prizeDetails}
                onChange={(e) => handleChange('prizeDetails', e.target.value)}
                placeholder="각 상의 상금, 혜택, 수상 인원 등 시상 내역을 상세히 입력하세요..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resultAnnouncement">결과 발표</Label>
              <Textarea
                id="resultAnnouncement"
                value={formData.resultAnnouncement}
                onChange={(e) => handleChange('resultAnnouncement', e.target.value)}
                placeholder="결과 발표 일정, 방법, 장소, 시상식 정보 등을 입력하세요..."
                rows={3}
              />
            </div>
          </div>

          {/* 주의사항 및 기타 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">주의사항 및 기타</h3>
            
            <div className="space-y-2">
              <Label htmlFor="precautions">유의사항</Label>
              <Textarea
                id="precautions"
                value={formData.precautions}
                onChange={(e) => handleChange('precautions', e.target.value)}
                placeholder="참가 조건, 제한사항, 저작권, 기타 주의사항을 입력하세요..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">추가 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="위에서 다루지 않은 추가적인 공모전 정보를 입력하세요..."
                rows={3}
              />
            </div>
          </div>


          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 contest-button-primary">
              <FileText className="h-4 w-4 mr-2" />
              등록하기
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                취소
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContestForm;
