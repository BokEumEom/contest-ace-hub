import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onLogin }) => {
  return (
    <section className="hero-section relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-contest-gradient p-4 rounded-2xl shadow-lg animate-pulse-glow">
              <Calendar className="h-12 w-12 text-white animate-float" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            ContestHub
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
            공모전 관리를 한 곳에서<br />
            <span className="gradient-text font-semibold">
              체계적이고 효율적으로
            </span>
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto animate-slide-up">
            AI 프롬프트 관리부터 팀 협업까지, 공모전 준비의 모든 과정을 
            ContestHub에서 완벽하게 관리하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="contest-button-primary px-8 py-4 text-lg font-semibold hover-lift"
            >
              무료로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
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
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-contest-orange/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-contest-coral/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
    </section>
  );
};

export default HeroSection; 