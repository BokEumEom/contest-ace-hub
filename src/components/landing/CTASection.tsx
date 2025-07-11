import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onGetStarted, onLogin }) => {
  return (
    <section className="cta-section py-20 bg-gradient-to-r from-contest-orange to-contest-coral">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in">
          지금 바로 시작하세요
        </h2>
        <p className="text-xl text-white/90 mb-8 animate-slide-up">
          무료로 가입하고 공모전 준비를 더욱 효율적으로 만들어보세요
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <Button 
            onClick={onGetStarted}
            size="lg"
            variant="secondary"
            className="px-8 py-4 text-lg font-semibold bg-white text-contest-orange hover:bg-gray-100 hover-lift"
          >
            무료 회원가입
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            onClick={onLogin}
            size="lg"
            variant="outline"
            className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-contest-orange hover-lift"
          >
            로그인
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 