import React from 'react';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const WelcomeSection: React.FC = () => {
  const { user } = useAuth();
  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return '좋은 아침이에요';
    if (currentHour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return '사용자';
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-contest-orange/10 to-contest-coral/10 rounded-2xl p-6 border border-orange-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-contest-orange" />
              <span className="text-sm font-medium text-contest-orange">
                {getGreeting()}, {getUserName()}님! 👋
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              오늘도 공모전 준비
              <br />
              <span className="gradient-text">화이팅하세요!</span>
            </h2>
            <p className="text-gray-600 mb-4">
              체계적인 관리로 공모전 성공을 위한 모든 준비를 도와드릴게요.
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>진행률 향상</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <Calendar className="h-4 w-4" />
                <span>일정 관리</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Element */}
          <div className="hidden md:block">
            <div className="bg-contest-gradient p-4 rounded-2xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection; 