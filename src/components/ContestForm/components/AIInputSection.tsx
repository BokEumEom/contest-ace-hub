import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Globe, Copy, Loader2 } from 'lucide-react';
import { AIIntegrationState, AIMethod } from '../types';
import { AI_TEXT_EXAMPLE } from '../constants';

interface AIInputSectionProps {
  aiState: AIIntegrationState;
  onMethodChange: (method: AIMethod) => void;
  onUrlInputChange: (value: string) => void;
  onTextInputChange: (value: string) => void;
  onExtractFromUrl: () => void;
  onExtractFromText: () => void;
}

export const AIInputSection: React.FC<AIInputSectionProps> = ({
  aiState,
  onMethodChange,
  onUrlInputChange,
  onTextInputChange,
  onExtractFromUrl,
  onExtractFromText
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          AI 기반 공모전 등록
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 방법 선택 탭 */}
          <div className="flex border rounded-lg p-1 bg-white">
            <button
              onClick={() => onMethodChange('url')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                aiState.activeMethod === 'url'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="h-4 w-4 inline mr-2" />
              URL 입력
            </button>
            <button
              onClick={() => onMethodChange('text')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                aiState.activeMethod === 'text'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Copy className="h-4 w-4 inline mr-2" />
              텍스트 붙여넣기
            </button>
          </div>

          {/* URL 입력 방법 */}
          {aiState.activeMethod === 'url' && (
            <div className="space-y-2">
              <Label htmlFor="urlInput">공모전 URL</Label>
              <div className="flex gap-2">
                <Input
                  id="urlInput"
                  value={aiState.urlInput}
                  onChange={(e) => onUrlInputChange(e.target.value)}
                  placeholder="https://contest.example.com"
                  type="url"
                  className="flex-1"
                />
                <Button
                  onClick={onExtractFromUrl}
                  disabled={aiState.isLoading || !aiState.urlInput.trim()}
                  className="contest-button-primary"
                >
                  {aiState.isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {aiState.isLoading ? '추출 중...' : 'AI로 추출'}
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
          )}

          {/* 텍스트 붙여넣기 방법 */}
          {aiState.activeMethod === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="textInput">공모전 정보 텍스트</Label>
              <div className="space-y-2">
                <Textarea
                  id="textInput"
                  value={aiState.textInput}
                  onChange={(e) => onTextInputChange(e.target.value)}
                  placeholder={AI_TEXT_EXAMPLE}
                  rows={8}
                  className="resize-none"
                />
                <Button
                  onClick={onExtractFromText}
                  disabled={aiState.isLoading || !aiState.textInput.trim()}
                  className="contest-button-primary w-full"
                >
                  {aiState.isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {aiState.isLoading ? '추출 중...' : 'AI로 추출'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                공모전 정보를 텍스트로 붙여넣으면 AI가 자동으로 정보를 추출합니다.
                <br />
                <span className="text-blue-600">
                  설정에서 Gemini API 키를 설정해야 합니다.
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 