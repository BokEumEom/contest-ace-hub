
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CrawlService } from '@/services/crawlService';
import { GeminiService } from '@/services/geminiService';
import { Settings as SettingsIcon, Key, Globe, Brain } from 'lucide-react';
import Header from '@/components/Header';

const Settings = () => {
  const [firecrawlApiKey, setFirecrawlApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isTestingFirecrawl, setIsTestingFirecrawl] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [existingFirecrawlKey, setExistingFirecrawlKey] = useState<string | null>(null);
  const [existingGeminiKey, setExistingGeminiKey] = useState<string | null>(null);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const { toast } = useToast();

  // Load existing API keys on component mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const [firecrawlKey, geminiKey] = await Promise.all([
          CrawlService.getApiKey(),
          GeminiService.getApiKey()
        ]);
        setExistingFirecrawlKey(firecrawlKey);
        setExistingGeminiKey(geminiKey);
      } catch (error) {
        console.error('Error loading API keys:', error);
      } finally {
        setIsLoadingKeys(false);
      }
    };

    loadApiKeys();
  }, []);

  const handleSaveFirecrawlKey = async () => {
    if (!firecrawlApiKey.trim()) {
      toast({
        title: "오류",
        description: "Firecrawl API 키를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingFirecrawl(true);
    
    try {
      const isValid = await CrawlService.testApiKey(firecrawlApiKey);
      
      if (isValid) {
        await CrawlService.saveApiKey(firecrawlApiKey);
        setExistingFirecrawlKey(firecrawlApiKey);
        toast({
          title: "성공",
          description: "Firecrawl API 키가 저장되었습니다."
        });
        setFirecrawlApiKey('');
      } else {
        toast({
          title: "오류",
          description: "유효하지 않은 Firecrawl API 키입니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 검증 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsTestingFirecrawl(false);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: "오류",
        description: "Gemini API 키를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingGemini(true);
    
    try {
      const isValid = await GeminiService.testApiKey(geminiApiKey);
      
      if (isValid) {
        await GeminiService.saveApiKey(geminiApiKey);
        setExistingGeminiKey(geminiApiKey);
        toast({
          title: "성공",
          description: "Gemini API 키가 저장되었습니다."
        });
        setGeminiApiKey('');
      } else {
        toast({
          title: "오류",
          description: "유효하지 않은 Gemini API 키입니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 검증 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-contest-primary" />
            <h1 className="text-3xl font-bold text-gray-900">설정</h1>
          </div>
          <p className="text-gray-600">API 키를 관리하고 서비스 설정을 변경하세요.</p>
        </div>

        <div className="space-y-6">
          {/* Firecrawl API 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Firecrawl API 설정
              </CardTitle>
              <CardDescription>
                웹 크롤링 기능을 사용하기 위한 Firecrawl API 키를 설정하세요.
                <a 
                  href="https://www.firecrawl.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline ml-1"
                >
                  무료 API 키 발급받기
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingKeys ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">API 키 상태 확인 중...</span>
                </div>
              ) : existingFirecrawlKey ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">API 키가 설정되어 있습니다</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-orange-700">API 키가 설정되지 않았습니다</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="firecrawl-api-key">API 키</Label>
                <Input
                  id="firecrawl-api-key"
                  type="password"
                  placeholder="fc-..."
                  value={firecrawlApiKey}
                  onChange={(e) => setFirecrawlApiKey(e.target.value)}
                />
              </div>
              
              <Button
                onClick={handleSaveFirecrawlKey}
                disabled={isTestingFirecrawl || !firecrawlApiKey.trim()}
                className="w-full"
              >
                {isTestingFirecrawl ? "검증 중..." : "API 키 저장"}
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Gemini API 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Gemini API 설정
              </CardTitle>
              <CardDescription>
                AI 어시스턴트 기능을 사용하기 위한 Google Gemini API 키를 설정하세요.
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline ml-1"
                >
                  무료 API 키 발급받기
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingKeys ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">API 키 상태 확인 중...</span>
                </div>
              ) : existingGeminiKey ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">API 키가 설정되어 있습니다</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-orange-700">API 키가 설정되지 않았습니다</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="gemini-api-key">API 키</Label>
                <Input
                  id="gemini-api-key"
                  type="password"
                  placeholder="AIza..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
              </div>
              
              <Button
                onClick={handleSaveGeminiKey}
                disabled={isTestingGemini || !geminiApiKey.trim()}
                className="w-full"
              >
                {isTestingGemini ? "검증 중..." : "API 키 저장"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
