import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export const ApiKeyRequired: React.FC = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          API 키 필요
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          크롤링 기능을 사용하려면 먼저 설정에서 Firecrawl API 키를 설정해주세요.
        </p>
        <Button onClick={() => window.location.href = '/settings'} className="w-full">
          설정으로 이동
        </Button>
      </CardContent>
    </Card>
  );
}; 