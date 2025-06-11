
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, FileText, Lightbulb, Loader2 } from 'lucide-react';
import { GeminiService } from '@/services/geminiService';
import { toast } from 'sonner';

const AIAssistant: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [contestTitle, setContestTitle] = useState('');
  const [contestDescription, setContestDescription] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentType, setDocumentType] = useState('기획서');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [review, setReview] = useState('');
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  const generateIdeas = async () => {
    if (!apiKey) {
      toast.error('Gemini API 키를 입력해주세요.');
      return;
    }
    
    if (!contestTitle || !contestDescription) {
      toast.error('공모전 제목과 설명을 입력해주세요.');
      return;
    }

    setLoadingIdeas(true);
    try {
      const gemini = new GeminiService(apiKey);
      const generatedIdeas = await gemini.generateIdeas(contestTitle, contestDescription);
      setIdeas(generatedIdeas);
      toast.success('아이디어가 생성되었습니다!');
    } catch (error) {
      toast.error('아이디어 생성에 실패했습니다. API 키를 확인해주세요.');
      console.error(error);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const reviewDocument = async () => {
    if (!apiKey) {
      toast.error('Gemini API 키를 입력해주세요.');
      return;
    }
    
    if (!documentContent) {
      toast.error('검토할 문서 내용을 입력해주세요.');
      return;
    }

    setLoadingReview(true);
    try {
      const gemini = new GeminiService(apiKey);
      const reviewResult = await gemini.reviewDocument(documentContent, documentType);
      setReview(reviewResult);
      toast.success('문서 검토가 완료되었습니다!');
    } catch (error) {
      toast.error('문서 검토에 실패했습니다. API 키를 확인해주세요.');
      console.error(error);
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API 키 입력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-contest-orange" />
            AI 어시스턴트 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API 키</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini API 키를 입력하세요"
            />
            <p className="text-xs text-muted-foreground">
              API 키는 <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-contest-orange hover:underline">Google AI Studio</a>에서 발급받을 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 아이디어 브레인스토밍 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-contest-blue" />
            아이디어 브레인스토밍
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contestTitle">공모전 제목</Label>
            <Input
              id="contestTitle"
              value={contestTitle}
              onChange={(e) => setContestTitle(e.target.value)}
              placeholder="공모전 제목을 입력하세요"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contestDescription">공모전 설명</Label>
            <Textarea
              id="contestDescription"
              value={contestDescription}
              onChange={(e) => setContestDescription(e.target.value)}
              placeholder="공모전의 주제와 요구사항을 입력하세요"
              rows={3}
            />
          </div>

          <Button 
            onClick={generateIdeas} 
            disabled={loadingIdeas}
            className="w-full contest-button-primary"
          >
            {loadingIdeas ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4 mr-2" />
            )}
            아이디어 생성하기
          </Button>

          {ideas.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">생성된 아이디어:</h4>
              <ul className="space-y-2">
                {ideas.map((idea, index) => (
                  <li key={index} className="text-sm text-muted-foreground bg-white p-3 rounded border">
                    {idea}
                  </li>
                ))}
              </ul>
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
            disabled={loadingReview}
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
