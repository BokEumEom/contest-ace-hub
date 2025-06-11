
import React from 'react';
import Header from '@/components/Header';
import AIAssistant from '@/components/AIAssistant';
import { Sparkles } from 'lucide-react';

const AIHelper = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-contest-orange" />
            <h2 className="text-3xl font-bold text-foreground">
              AI 어시스턴트
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gemini AI를 활용하여 공모전 아이디어 발굴부터 문서 검토까지, 
            체계적인 공모전 준비를 도와드립니다.
          </p>
        </div>

        <AIAssistant />
      </main>
    </div>
  );
};

export default AIHelper;
