import React from 'react';
import { Calendar, Zap, Users, Trophy, Clock, Shield } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Calendar,
      title: '공모전 관리',
      description: '마감일, 진행상황, 팀원 관리까지 한눈에',
      features: ['실시간 D-day 계산', '진행상황 추적', '팀원 역할 관리'],
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      animationDelay: '0s'
    },
    {
      icon: Zap,
      title: 'AI 프롬프트 관리',
      description: 'AI 생성물과 프롬프트를 체계적으로 관리',
      features: ['프롬프트 템플릿 저장', 'AI 모델별 최적화', '생성물과 프롬프트 연결'],
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      animationDelay: '0.1s'
    },
    {
      icon: Users,
      title: '팀 협업',
      description: '팀원들과 효율적으로 협업하세요',
      features: ['팀원 역할 분담', '진행상황 공유', '파일 공유 및 관리'],
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      animationDelay: '0.2s'
    },
    {
      icon: Trophy,
      title: '작품 관리',
      description: '제출물과 관련 파일을 체계적으로 관리',
      features: ['파일 업로드 및 관리', '작품 설명 작성', '버전 관리'],
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      animationDelay: '0.3s'
    },
    {
      icon: Clock,
      title: '일정 관리',
      description: '중요한 마감일과 일정을 놓치지 마세요',
      features: ['마감일 알림', '단계별 일정 관리', '진행상황 추적'],
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      animationDelay: '0.4s'
    },
    {
      icon: Shield,
      title: '보안 및 안전',
      description: '안전하고 신뢰할 수 있는 서비스',
      features: ['데이터 암호화', '안전한 파일 저장', '개인정보 보호'],
      iconBgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      animationDelay: '0.5s'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            모든 공모전 준비를 위한 완벽한 솔루션
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-up">
            체계적인 관리부터 AI 활용까지, ContestHub가 도와드립니다
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 