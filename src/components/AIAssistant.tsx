import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, FileText, Lightbulb, Loader2, Settings } from 'lucide-react';
import { GeminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface AIAssistantProps {
  contestTitle?: string;
  contestDescription?: string;
  contestTheme?: string;
  submissionFormat?: string;
  submissionMethod?: string;
  prizeDetails?: string;
  precautions?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  contestTitle: initialContestTitle = '',
  contestDescription: initialContestDescription = '',
  contestTheme = '',
  submissionFormat = '',
  submissionMethod = '',
  prizeDetails = '',
  precautions = ''
}) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [contestTitle, setContestTitle] = useState(initialContestTitle);
  const [contestDescription, setContestDescription] = useState(initialContestDescription);
  const [documentContent, setDocumentContent] = useState('');
  const [documentType, setDocumentType] = useState('기획서');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [review, setReview] = useState('');
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialContestTitle) {
      setContestTitle(initialContestTitle);
    }
    if (initialContestDescription) {
      setContestDescription(initialContestDescription);
    }
  }, [initialContestTitle, initialContestDescription]);

  useEffect(() => {
    const savedKey = GeminiService.getApiKey();
    setApiKey(savedKey);
  }, []);

  const generateRichDescription = () => {
    let description = contestDescription || initialContestDescription;
    
    if (contestTheme) {
      description += `\n\n공모 주제: ${contestTheme}`;
    }
    
    if (submissionFormat) {
      description += `\n\n출품 규격: ${submissionFormat}`;
    }
    
    if (submissionMethod) {
      description += `\n\n출품 방법: ${submissionMethod}`;
    }
    
    if (prizeDetails) {
      description += `\n\n시상 내역: ${prizeDetails}`;
    }
    
    if (precautions) {
      description += `\n\n주의사항: ${precautions}`;
    }
    
    return description;
  };

  const generateIdeas = async () => {
    if (!apiKey) {
      toast({
        title: "API 키 필요",
        description: "AI 기능을 사용하려면 설정에서 Gemini API 키를 설정해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    if (!contestTitle || (!contestDescription && !initialContestDescription)) {
      toast({
        title: "오류",
        description: "공모전 제목과 설명을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setLoadingIdeas(true);
    try {
      const gemini = new GeminiService(apiKey);
      const richDescription = generateRichDescription();
      console.log('Generating ideas with:', { contestTitle, richDescription, contestTheme, submissionFormat, prizeDetails, precautions });
      const generatedIdeas = await gemini.generateIdeas(
        contestTitle, 
        richDescription,
        contestTheme,
        submissionFormat,
        prizeDetails,
        precautions
      );
      console.log('Generated ideas:', generatedIdeas);
      setIdeas(generatedIdeas);
      toast({
        title: "성공",
        description: "아이디어가 생성되었습니다!"
      });
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "오류",
        description: "아이디어 생성에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoadingIdeas(false);
    }
  };

  const reviewDocument = async () => {
    if (!apiKey) {
      toast({
        title: "API 키 필요",
        description: "AI 기능을 사용하려면 설정에서 Gemini API 키를 설정해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    if (!documentContent) {
      toast({
        title: "오류",
        description: "검토할 문서 내용을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setLoadingReview(true);
    try {
      const gemini = new GeminiService(apiKey);
      const reviewResult = await gemini.reviewDocument(documentContent, documentType);
      setReview(reviewResult);
      toast({
        title: "성공",
        description: "문서 검토가 완료되었습니다!"
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "문서 검토에 실패했습니다.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setLoadingReview(false);
    }
  };

  // API 키가 없을 때 표시할 안내 컴포넌트
  const ApiKeyNotice = () => (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Settings className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-orange-800 mb-2">AI 기능 사용을 위한 설정 필요</h4>
            <p className="text-sm text-orange-700 mb-3">
              AI 어시스턴트 기능을 사용하려면 Gemini API 키를 설정해야 합니다.
            </p>
            <Link 
              to="/settings" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors"
            >
              <Settings className="h-4 w-4" />
              설정 페이지로 이동
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* API 키가 없을 때 안내 메시지 */}
      {!apiKey && <ApiKeyNotice />}

      {/* 아이디어 브레인스토밍 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-contest-blue" />
            아이디어 브레인스토밍
          </CardTitle>
          {(initialContestTitle || initialContestDescription) && (
            <CardDescription className="text-sm text-green-600">
              ✓ 공모전 정보가 자동으로 입력되었습니다
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contestTitle">공모전 제목</Label>
            <Input
              id="contestTitle"
              value={contestTitle}
              onChange={(e) => setContestTitle(e.target.value)}
              placeholder="공모전 제목을 입력하세요"
              className={initialContestTitle ? "border-green-200 bg-green-50" : ""}
            />
            {initialContestTitle && (
              <p className="text-xs text-green-600">자동 입력됨: {initialContestTitle}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contestDescription">공모전 설명</Label>
            <Textarea
              id="contestDescription"
              value={contestDescription}
              onChange={(e) => setContestDescription(e.target.value)}
              placeholder="공모전의 주제와 요구사항을 입력하세요"
              rows={3}
              className={initialContestDescription ? "border-green-200 bg-green-50" : ""}
            />
            {initialContestDescription && (
              <p className="text-xs text-green-600">
                자동 입력됨: {initialContestDescription.length > 50 
                  ? initialContestDescription.substring(0, 50) + '...' 
                  : initialContestDescription}
              </p>
            )}
          </div>

          {/* 추가 공모전 정보 표시 */}
          {(contestTheme || submissionFormat || submissionMethod || prizeDetails || precautions) && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">📋 추가 공모전 정보</p>
              <div className="space-y-1 text-xs text-blue-700">
                {contestTheme && <p>• 공모 주제: {contestTheme}</p>}
                {submissionFormat && <p>• 출품 규격: {submissionFormat}</p>}
                {submissionMethod && <p>• 출품 방법: {submissionMethod}</p>}
                {prizeDetails && <p>• 시상 내역: {prizeDetails}</p>}
                {precautions && <p>• 주의사항: {precautions}</p>}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                이 정보들이 아이디어 생성에 활용됩니다.
              </p>
            </div>
          )}

          <Button 
            onClick={generateIdeas} 
            disabled={loadingIdeas || !apiKey}
            className="w-full contest-button-primary"
          >
            {loadingIdeas ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4 mr-2" />
            )}
            아이디어 생성하기
          </Button>

          {/* 상태 메시지 */}
          {!apiKey && (
            <p className="text-xs text-orange-600 text-center">
              아이디어 생성을 위해 먼저 설정에서 API 키를 설정해주세요.
            </p>
          )}
          
          {apiKey && !contestTitle && (
            <p className="text-xs text-orange-600 text-center">
              공모전 제목을 입력해주세요.
            </p>
          )}
          
          {apiKey && contestTitle && (!contestDescription && !initialContestDescription) && (
            <p className="text-xs text-orange-600 text-center">
              공모전 설명을 입력해주세요.
            </p>
          )}
          
          {apiKey && contestTitle && (contestDescription || initialContestDescription) && ideas.length === 0 && !loadingIdeas && (
            <p className="text-xs text-blue-600 text-center">
              위 정보를 바탕으로 아이디어를 생성할 준비가 되었습니다.
            </p>
          )}

          {ideas.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">생성된 아이디어 ({ideas.length}개):</h4>
              <div className="space-y-2">
                {ideas.map((idea, index) => (
                  <div key={index} className="text-sm bg-white p-3 rounded border">
                    <div className="flex items-start gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {index + 1}
                      </span>
                      <span className="flex-1">{idea}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 디버깅 정보 (개발 모드에서만 표시) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">디버깅 정보:</p>
              <p className="text-xs text-gray-600">아이디어 개수: {ideas.length}</p>
              <p className="text-xs text-gray-600">API 키 설정: {apiKey ? '예' : '아니오'}</p>
              <p className="text-xs text-gray-600">로딩 중: {loadingIdeas ? '예' : '아니오'}</p>
              <p className="text-xs text-gray-600">제목: {contestTitle || '없음'}</p>
              <p className="text-xs text-gray-600">설명: {(contestDescription || initialContestDescription) ? '있음' : '없음'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 문서 검토 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-contest-coral" />
            문서 자동 검토
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">문서 유형</Label>
            <Input
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="예: 기획서, 제안서, 보고서"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentContent">문서 내용</Label>
            <Textarea
              id="documentContent"
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              placeholder="검토받을 문서 내용을 입력하세요"
              rows={6}
            />
          </div>

          <Button 
            onClick={reviewDocument} 
            disabled={loadingReview || !apiKey}
            className="w-full contest-button-primary"
          >
            {loadingReview ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            문서 검토하기
          </Button>

          {review && (
            <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">검토 결과:</h4>
              <div className="text-sm text-muted-foreground bg-white p-4 rounded border whitespace-pre-wrap">
                {review}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
