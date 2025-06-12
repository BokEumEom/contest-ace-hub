
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CrawlService } from '@/services/crawlService';
import { Key, Globe } from 'lucide-react';

interface CrawlSetupProps {
  onSetupComplete?: () => void;
}

const CrawlSetup: React.FC<CrawlSetupProps> = ({ onSetupComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  
  const existingApiKey = CrawlService.getApiKey();

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "오류",
        description: "API 키를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const isValid = await CrawlService.testApiKey(apiKey);
      
      if (isValid) {
        CrawlService.saveApiKey(apiKey);
        toast({
          title: "성공",
          description: "API 키가 저장되었습니다."
        });
        onSetupComplete?.();
      } else {
        toast({
          title: "오류",
          description: "유효하지 않은 API 키입니다.",
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
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Firecrawl API 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingApiKey ? (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Globe className="h-4 w-4" />
              <span className="text-sm">API 키가 설정되어 있습니다</span>
            </div>
            <Button
              variant="outline"
              onClick={() => onSetupComplete?.()}
              className="w-full"
            >
              크롤링 시작하기
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Firecrawl API 키
              </label>
              <Input
                type="password"
                placeholder="fc-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                <a 
                  href="https://www.firecrawl.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Firecrawl.dev
                </a>에서 무료 API 키를 발급받으세요.
              </p>
            </div>
            
            <Button
              onClick={handleSaveApiKey}
              disabled={isValidating}
              className="w-full"
            >
              {isValidating ? "검증 중..." : "API 키 저장"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CrawlSetup;
