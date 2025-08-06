import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Users } from 'lucide-react';
import { ContestFormData } from '../types';
import { MIN_TEAM_MEMBERS, MAX_TEAM_MEMBERS, SUBMISSION_FORMAT_EXAMPLE } from '../constants';

interface FormSectionsProps {
  formData: ContestFormData;
  onFieldChange: (field: string, value: string | number) => void;
}

// 기본 정보 섹션
export const BasicInfoSection: React.FC<FormSectionsProps> = ({ formData, onFieldChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-foreground border-b pb-2">기본 정보</h3>
    
    <div className="space-y-2">
      <Label htmlFor="title">공모전 제목 *</Label>
      <Input
        id="title"
        value={formData.title}
        onChange={(e) => onFieldChange('title', e.target.value)}
        placeholder="예: 2024 스마트시티 아이디어 공모전"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="contestUrl">공모전 URL</Label>
      <Input
        id="contestUrl"
        value={formData.contestUrl}
        onChange={(e) => onFieldChange('contestUrl', e.target.value)}
        placeholder="예: https://contest.example.com"
        type="url"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="organization">주최기관 *</Label>
        <Input
          id="organization"
          value={formData.organization}
          onChange={(e) => onFieldChange('organization', e.target.value)}
          placeholder="예: 과학기술정보통신부"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">카테고리</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => onFieldChange('category', e.target.value)}
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
            onChange={(e) => onFieldChange('deadline', e.target.value)}
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
          onChange={(e) => onFieldChange('prize', e.target.value)}
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
          min={MIN_TEAM_MEMBERS}
          max={MAX_TEAM_MEMBERS}
          value={formData.teamMembers}
          onChange={(e) => onFieldChange('teamMembers', parseInt(e.target.value))}
          className="pl-10"
        />
      </div>
    </div>
  </div>
);

// 상세 정보 섹션
export const DetailedInfoSection: React.FC<FormSectionsProps> = ({ formData, onFieldChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-foreground border-b pb-2">공모전 상세 정보</h3>
    
    <div className="space-y-2">
      <Label htmlFor="description">공모전 설명</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => onFieldChange('description', e.target.value)}
        placeholder="공모전에 대한 간단한 설명을 입력하세요..."
        rows={3}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="contestTheme">공모 주제</Label>
      <Textarea
        id="contestTheme"
        value={formData.contestTheme}
        onChange={(e) => onFieldChange('contestTheme', e.target.value)}
        placeholder="공모전의 주제와 목적을 상세히 입력하세요..."
        rows={3}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="submissionFormat">출품 규격</Label>
      <Textarea
        id="submissionFormat"
        value={formData.submissionFormat}
        onChange={(e) => onFieldChange('submissionFormat', e.target.value)}
        placeholder={SUBMISSION_FORMAT_EXAMPLE}
        rows={4}
      />
      <p className="text-xs text-muted-foreground">
        파일 형식, 크기, 해상도, 용량 제한, 페이지 수 등을 구체적으로 입력하세요.
      </p>
    </div>
  </div>
);

// 일정 및 절차 섹션
export const ScheduleProcedureSection: React.FC<FormSectionsProps> = ({ formData, onFieldChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-foreground border-b pb-2">일정 및 절차</h3>
    
    <div className="space-y-2">
      <Label htmlFor="contestSchedule">공모 일정</Label>
      <Textarea
        id="contestSchedule"
        value={formData.contestSchedule}
        onChange={(e) => onFieldChange('contestSchedule', e.target.value)}
        placeholder="공모전의 주요 일정을 입력하세요..."
        rows={3}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="submissionMethod">제출 방법</Label>
      <Textarea
        id="submissionMethod"
        value={formData.submissionMethod}
        onChange={(e) => onFieldChange('submissionMethod', e.target.value)}
        placeholder="제출 방법과 절차를 입력하세요..."
        rows={3}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="resultAnnouncement">결과 발표</Label>
      <Textarea
        id="resultAnnouncement"
        value={formData.resultAnnouncement}
        onChange={(e) => onFieldChange('resultAnnouncement', e.target.value)}
        placeholder="결과 발표 일정과 방법을 입력하세요..."
        rows={2}
      />
    </div>
  </div>
);

// 상금 및 주의사항 섹션
export const PrizePrecautionsSection: React.FC<FormSectionsProps> = ({ formData, onFieldChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-foreground border-b pb-2">상금 및 주의사항</h3>
    
    <div className="space-y-2">
      <Label htmlFor="prizeDetails">상금 상세</Label>
      <Textarea
        id="prizeDetails"
        value={formData.prizeDetails}
        onChange={(e) => onFieldChange('prizeDetails', e.target.value)}
        placeholder="상금의 상세 내역을 입력하세요..."
        rows={3}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="precautions">주의사항</Label>
      <Textarea
        id="precautions"
        value={formData.precautions}
        onChange={(e) => onFieldChange('precautions', e.target.value)}
        placeholder="참가 시 주의사항을 입력하세요..."
        rows={3}
      />
    </div>
  </div>
); 