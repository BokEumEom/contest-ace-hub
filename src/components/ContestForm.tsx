import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Trophy, FileText, Globe, Sparkles, Loader2 } from 'lucide-react';
import { Contest } from '@/types/contest';
import { useContests } from '@/hooks/useContests';
import { toast } from 'sonner';
import { CrawlService } from '@/services/crawlService';
import { GeminiService } from '@/services/geminiService';

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

  // AI 기반 등록 상태
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUrlSection, setShowUrlSection] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.organization || !formData.deadline) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const newContest = await addContest({
      title: formData.title,
      organization: formData.organization,
      deadline: formData.deadline,
      category: formData.category,
      prize: formData.prize,
      description: formData.description,
      contest_theme: formData.contestTheme,
      submission_format: formData.submissionFormat,
      contest_schedule: formData.contestSchedule,
      submission_method: formData.submissionMethod,
      prize_details: formData.prizeDetails,
      result_announcement: formData.resultAnnouncement,
      precautions: formData.precautions,
      contest_url: formData.contestUrl,
      status: 'preparing' as const,
      days_left: daysLeft,
      progress: 0,
      team_members_count: formData.teamMembers,
    });

    if (newContest) {
      toast.success('새 공모전이 등록되었습니다!');
      onSuccess?.(newContest as any);
    } else {
      toast.error('공모전 등록에 실패했습니다.');
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // AI를 활용한 URL에서 공모전 정보 추출
  const handleExtractFromUrl = async () => {
    if (!urlInput.trim()) {
      toast.error('URL을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // API 키 확인 (비동기)
      const [geminiApiKey, firecrawlApiKey] = await Promise.all([
        GeminiService.getApiKey(),
        CrawlService.getApiKey()
      ]);
      
      if (!geminiApiKey) {
        toast.error('AI 기능을 사용하려면 설정에서 Gemini API 키를 설정해주세요.');
        return;
      }
      
      if (!firecrawlApiKey) {
        toast.error('웹 크롤링을 위해 설정에서 Firecrawl API 키를 설정해주세요.');
        return;
      }

      // 1. URL에서 페이지 내용 크롤링
      const scrapedData = await CrawlService.scrapePage(urlInput);
      if (!scrapedData.success || !scrapedData.data) {
        toast.error('URL에서 정보를 가져올 수 없습니다.');
        return;
      }

      // 2. AI를 활용한 정보 추출
      const gemini = new GeminiService(geminiApiKey);
      const markdown = scrapedData.data.markdown || '';
      const contestInfo = await gemini.extractContestInfoFromUrl(urlInput, markdown);

      // 3. 폼 데이터 업데이트
      setFormData({
        title: contestInfo.title,
        organization: contestInfo.organization,
        deadline: contestInfo.deadline,
        category: contestInfo.category,
        prize: contestInfo.prize,
        description: contestInfo.description,
        teamMembers: 1,
        contestTheme: contestInfo.contestTheme,
        submissionFormat: contestInfo.submissionFormat,
        contestSchedule: contestInfo.contestSchedule,
        submissionMethod: contestInfo.submissionMethod,
        prizeDetails: contestInfo.prizeDetails,
        resultAnnouncement: contestInfo.resultAnnouncement,
        precautions: contestInfo.precautions,
        contestUrl: urlInput,
      });

      toast.success('AI가 공모전 정보를 추출했습니다!');
      setShowUrlSection(false); // URL 섹션 숨기기
    } catch (error) {
      console.error('AI 정보 추출 실패:', error);
      toast.error('AI 정보 추출에 실패했습니다. 수동으로 입력해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI 기반 URL 입력 섹션 */}
      {showUrlSection && (
        <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI 기반 공모전 등록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="urlInput">공모전 URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="urlInput"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://contest.example.com"
                    type="url"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleExtractFromUrl}
                    disabled={isLoading || !urlInput.trim()}
                    className="contest-button-primary"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? '추출 중...' : 'AI로 추출'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  공모전 URL을 입력하면 AI가 자동으로 정보를 추출합니다.
                  <br />
                  <span className="text-blue-600">
                    설정에서 Gemini API 키와 Firecrawl API 키를 설정해야 합니다.
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 수동 입력 폼 */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-contest-orange" />
            {showUrlSection ? '수동 입력' : '공모전 정보 확인'}
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
                <Label htmlFor="description">공모전 설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="공모전에 대한 간단한 설명을 입력하세요..."
                  rows={3}
                />
              </div>

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
                  placeholder="예: 이미지 형식: JPEG, JPG, PNG (300dpi 이상, 3:2 또는 2:3 비율, 30MB 이하)&#10;PDF: A4 10페이지 이하&#10;동영상: MP4, 3분 이하, 100MB 이하"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  파일 형식, 크기, 해상도, 용량 제한, 페이지 수 등을 구체적으로 입력하세요.
                </p>
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
                  placeholder="공모전의 주요 일정을 입력하세요..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionMethod">제출 방법</Label>
                <Textarea
                  id="submissionMethod"
                  value={formData.submissionMethod}
                  onChange={(e) => handleChange('submissionMethod', e.target.value)}
                  placeholder="제출 방법과 절차를 입력하세요..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultAnnouncement">결과 발표</Label>
                <Textarea
                  id="resultAnnouncement"
                  value={formData.resultAnnouncement}
                  onChange={(e) => handleChange('resultAnnouncement', e.target.value)}
                  placeholder="결과 발표 일정과 방법을 입력하세요..."
                  rows={2}
                />
              </div>
            </div>

            {/* 상금 및 주의사항 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">상금 및 주의사항</h3>
              
              <div className="space-y-2">
                <Label htmlFor="prizeDetails">상금 상세</Label>
                <Textarea
                  id="prizeDetails"
                  value={formData.prizeDetails}
                  onChange={(e) => handleChange('prizeDetails', e.target.value)}
                  placeholder="상금의 상세 내역을 입력하세요..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precautions">주의사항</Label>
                <Textarea
                  id="precautions"
                  value={formData.precautions}
                  onChange={(e) => handleChange('precautions', e.target.value)}
                  placeholder="참가 시 주의사항을 입력하세요..."
                  rows={3}
                />
              </div>
            </div>

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
