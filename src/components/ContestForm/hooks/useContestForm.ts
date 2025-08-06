import { useState } from 'react';
import { toast } from 'sonner';
import { useContests } from '@/hooks/useContests';
import { CrawlService } from '@/services/crawlService';
import { GeminiService } from '@/services/geminiService';
import { ContestFormData, ContestRegistrationData, AIIntegrationState, AIMethod } from '../types';
import { DEFAULT_FORM_DATA } from '../constants';
import { convertToContestRegistrationData, validateRequiredFields, convertAIToFormData } from '../utils';

export const useContestForm = (onSuccess?: (contest: any) => void) => {
  const { addContest } = useContests();
  const [formData, setFormData] = useState<ContestFormData>(DEFAULT_FORM_DATA);
  
  // AI 통합 상태
  const [aiState, setAiState] = useState<AIIntegrationState>({
    urlInput: '',
    textInput: '',
    isLoading: false,
    showUrlSection: true,
    activeMethod: 'url'
  });

  // 폼 필드 변경 핸들러
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // AI 상태 업데이트
  const updateAIState = (updates: Partial<AIIntegrationState>) => {
    setAiState(prev => ({ ...prev, ...updates }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRequiredFields(formData)) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      const contestData = convertToContestRegistrationData(formData);
      const newContest = await addContest(contestData);

      if (newContest) {
        toast.success('새 공모전이 등록되었습니다!');
        onSuccess?.(newContest);
      } else {
        toast.error('공모전 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Contest registration error:', error);
      toast.error('공모전 등록 중 오류가 발생했습니다.');
    }
  };

  // URL에서 AI 추출
  const handleExtractFromUrl = async () => {
    if (!aiState.urlInput.trim()) {
      toast.error('URL을 입력해주세요.');
      return;
    }

    updateAIState({ isLoading: true });
    
    try {
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
      const scrapedData = await CrawlService.scrapePage(aiState.urlInput);
      if (!scrapedData.success || !scrapedData.data) {
        toast.error('URL에서 정보를 가져올 수 없습니다.');
        return;
      }

      // 2. AI를 활용한 정보 추출
      const gemini = new GeminiService(geminiApiKey);
      const markdown = scrapedData.data.markdown || '';
      const contestInfo = await gemini.extractContestInfoFromUrl(aiState.urlInput, markdown);

      // 3. 폼 데이터 업데이트
      const newFormData = convertAIToFormData(contestInfo, aiState.urlInput);
      setFormData(newFormData);

      toast.success('AI가 공모전 정보를 추출했습니다!');
      updateAIState({ showUrlSection: false });
    } catch (error) {
      console.error('AI 정보 추출 실패:', error);
      toast.error('AI 정보 추출에 실패했습니다. 수동으로 입력해주세요.');
    } finally {
      updateAIState({ isLoading: false });
    }
  };

  // 텍스트에서 AI 추출
  const handleExtractFromText = async () => {
    if (!aiState.textInput.trim()) {
      toast.error('텍스트를 입력해주세요.');
      return;
    }

    updateAIState({ isLoading: true });
    
    try {
      const geminiApiKey = await GeminiService.getApiKey();
      
      if (!geminiApiKey) {
        toast.error('AI 기능을 사용하려면 설정에서 Gemini API 키를 설정해주세요.');
        return;
      }

      // AI를 활용한 정보 추출
      const gemini = new GeminiService(geminiApiKey);
      const contestInfo = await gemini.extractContestInfoFromText(aiState.textInput);

      // 폼 데이터 업데이트
      const newFormData = convertAIToFormData(contestInfo);
      setFormData(newFormData);

      toast.success('AI가 공모전 정보를 추출했습니다!');
      updateAIState({ showUrlSection: false });
    } catch (error) {
      console.error('AI 정보 추출 실패:', error);
      toast.error('AI 정보 추출에 실패했습니다. 수동으로 입력해주세요.');
    } finally {
      updateAIState({ isLoading: false });
    }
  };

  // AI 방법 변경
  const handleMethodChange = (method: AIMethod) => {
    updateAIState({ activeMethod: method });
  };

  return {
    // State
    formData,
    aiState,
    
    // Handlers
    handleChange,
    handleSubmit,
    handleExtractFromUrl,
    handleExtractFromText,
    handleMethodChange,
    updateAIState
  };
}; 