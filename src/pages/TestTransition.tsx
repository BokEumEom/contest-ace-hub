import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PageTransition from '@/components/PageTransition';
import NavigationTransition from '@/components/NavigationTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Home, User, Settings } from 'lucide-react';

const TestTransition = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <PageTransition isLoading={isLoading}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
              전환 효과 테스트
            </h1>
            <p className="text-lg text-gray-600 animate-fade-in-delayed">
              페이지 전환과 네비게이션 효과를 확인해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="card-hover animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  페이지 전환 테스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  다른 페이지로 이동하여 전환 효과를 확인해보세요.
                </p>
                <div className="flex flex-wrap gap-2">
                  <NavigationTransition to="/">
                    <Button variant="outline" className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      홈으로
                    </Button>
                  </NavigationTransition>
                  <NavigationTransition to="/profile">
                    <Button variant="outline" className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      프로필
                    </Button>
                  </NavigationTransition>
                  <NavigationTransition to="/settings">
                    <Button variant="outline" className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      설정
                    </Button>
                  </NavigationTransition>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  로딩 상태 테스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  로딩 상태를 시뮬레이션하여 전환 효과를 확인해보세요.
                </p>
                <Button 
                  onClick={handleTestLoading}
                  className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? '로딩 중...' : '로딩 테스트'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-hover animate-slide-in-left">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">부드러운 전환</h3>
                <p className="text-sm text-gray-600">
                  페이지 간 부드러운 애니메이션 전환
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">호버 효과</h3>
                <p className="text-sm text-gray-600">
                  마우스 호버 시 시각적 피드백
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">로딩 상태</h3>
                <p className="text-sm text-gray-600">
                  데이터 로딩 중 시각적 표시
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <NavigationTransition to="/">
              <Button className="contest-button-primary">
                홈으로 돌아가기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </NavigationTransition>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default TestTransition; 