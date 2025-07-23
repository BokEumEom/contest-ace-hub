import React from 'react';
import { Calendar, ArrowRight, Sparkles, Users, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onLogin }) => {
  return (
    <section className="hero-section relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-contest-gradient p-2 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-contest-orange bg-orange-50 px-3 py-1 rounded-full">
                🚀 새로운 공모전 관리 플랫폼
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight">
              공모전 준비를
              <br />
              <span className="gradient-text font-bold">
                한 번에 끝내세요
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 animate-slide-up leading-relaxed">
              AI 프롬프트 관리부터 팀 협업까지, 공모전 준비의 모든 과정을 
              <span className="font-semibold text-contest-orange"> ContestHub</span>에서 완벽하게 관리하세요.
            </p>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-contest-orange" />
                <span>AI 도우미</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-contest-blue" />
                <span>팀 협업</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-contest-coral" />
                <span>체계적 관리</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="contest-button-primary px-8 py-4 text-lg font-semibold hover-lift group"
              >
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={onLogin}
                className="px-8 py-4 text-lg font-semibold border-2 hover-lift"
              >
                로그인
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-contest-orange to-contest-coral border-2 border-white"></div>
                ))}
              </div>
              <span>이미 1,000+ 명이 사용 중</span>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Dashboard Mockup */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">ContestHub Dashboard</span>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">12</div>
                    <div className="text-xs text-blue-600">진행중</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">3</div>
                    <div className="text-xs text-orange-600">마감임박</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-600">85%</div>
                    <div className="text-xs text-green-600">평균진행률</div>
                  </div>
                </div>

                {/* Contest Cards */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">디자인 공모전</div>
                        <div className="text-xs text-gray-500">D-5</div>
                      </div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-12 h-2 bg-contest-gradient rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">개발 공모전</div>
                        <div className="text-xs text-gray-500">D-12</div>
                      </div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div className="w-8 h-2 bg-contest-gradient rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-contest-gradient p-3 rounded-xl shadow-lg animate-float">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-contest-coral p-3 rounded-xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-contest-orange/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-contest-coral/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-contest-blue/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </section>
  );
};

export default HeroSection; 