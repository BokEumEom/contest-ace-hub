import React from 'react';
import { Calendar, Zap, Users, Trophy, Clock, Shield, Sparkles, Target, FileText } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI 프롬프트 관리',
      description: 'AI 생성물과 프롬프트를 체계적으로 관리하여 창의성을 극대화하세요',
      features: ['프롬프트 템플릿 저장', 'AI 모델별 최적화', '생성물과 프롬프트 연결'],
      iconBgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
      iconColor: 'text-purple-600',
      animationDelay: '0s',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: '팀 협업',
      description: '팀원들과 효율적으로 협업하여 공모전 성공률을 높이세요',
      features: ['팀원 역할 분담', '진행상황 실시간 공유', '파일 공유 및 관리'],
      iconBgColor: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600',
      animationDelay: '0.1s',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: '체계적 관리',
      description: '마감일부터 진행상황까지 모든 과정을 한눈에 관리하세요',
      features: ['실시간 D-day 계산', '진행상황 추적', '일정 관리'],
      iconBgColor: 'bg-gradient-to-br from-orange-100 to-red-100',
      iconColor: 'text-orange-600',
      animationDelay: '0.2s',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-contest-gradient text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            핵심 기능
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            공모전 준비를 위한
            <br />
            <span className="gradient-text">완벽한 솔루션</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-up">
            AI 활용부터 팀 협업까지, ContestHub가 공모전 성공을 위한 모든 것을 제공합니다
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <FeatureCard {...feature} />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl inline-block mb-4">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">시간 절약</h3>
            <p className="text-gray-600">체계적인 관리로 준비 시간을 50% 단축</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl inline-block mb-4">
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">성공률 향상</h3>
            <p className="text-gray-600">체계적인 준비로 수상 확률을 높여보세요</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl inline-block mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">완벽한 제출</h3>
            <p className="text-gray-600">마감일 놓침 없이 완벽하게 제출하세요</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 