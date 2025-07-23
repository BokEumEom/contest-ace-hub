
import React, { useCallback, useMemo } from 'react';
import { Plus, Search, Calendar, Sparkles, Target, Users, TrendingUp, Clock, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

const QuickActions = React.memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 네비게이션 핸들러들 (메모이제이션)
  const handleNewContest = useCallback(() => navigate('/new-contest'), [navigate]);
  const handleExplore = useCallback(() => navigate('/explore'), [navigate]);
  const handleCalendar = useCallback(() => navigate('/calendar'), [navigate]);
  const handleAIHelper = useCallback(() => navigate('/ai-helper'), [navigate]);

  // 사용자 상태에 따른 액션 배열 (메모이제이션)
  const actions = useMemo(() => {
    const baseActions = [
      {
        icon: Plus,
        label: '공모전 등록',
        description: '새로운 공모전을 등록하고 관리하세요',
        color: 'orange',
        onClick: handleNewContest,
        priority: 'primary',
        gradient: 'from-contest-orange to-contest-coral',
        iconBg: 'bg-contest-orange/10 text-contest-orange'
      },
      {
        icon: Search,
        label: '공모전 탐색',
        description: '다양한 공모전을 찾아보세요',
        color: 'blue',
        onClick: handleExplore,
        priority: 'secondary',
        gradient: 'from-contest-blue to-contest-light-blue',
        iconBg: 'bg-contest-blue/10 text-contest-blue'
      }
    ];

    const userActions = user ? [
      {
        icon: Calendar,
        label: '일정 관리',
        description: '마감일과 진행상황을 확인하세요',
        color: 'green',
        onClick: handleCalendar,
        priority: 'secondary',
        gradient: 'from-green-500 to-emerald-500',
        iconBg: 'bg-green-500/10 text-green-600'
      },
      {
        icon: Sparkles,
        label: 'AI 도우미',
        description: 'AI로 아이디어와 피드백을 받아보세요',
        color: 'purple',
        onClick: handleAIHelper,
        priority: 'primary',
        gradient: 'from-purple-500 to-pink-500',
        iconBg: 'bg-purple-500/10 text-purple-600'
      }
    ] : [
      {
        icon: Calendar,
        label: '일정 미리보기',
        description: '공모전 일정을 확인해보세요',
        color: 'green',
        onClick: handleCalendar,
        priority: 'secondary',
        gradient: 'from-green-500 to-emerald-500',
        iconBg: 'bg-green-500/10 text-green-600'
      },
      {
        icon: Sparkles,
        label: 'AI 체험',
        description: 'AI 기능을 미리 체험해보세요',
        color: 'purple',
        onClick: handleAIHelper,
        priority: 'secondary',
        gradient: 'from-purple-500 to-pink-500',
        iconBg: 'bg-purple-500/10 text-purple-600'
      }
    ];

    return [...baseActions, ...userActions];
  }, [handleNewContest, handleExplore, handleCalendar, handleAIHelper, user]);

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">빠른 작업</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {user ? '자주 사용하는 기능에 빠르게 접근하세요' : '주요 기능을 미리 체험해보세요'}
          </p>
        </div>
      </div>
      
      {/* 액션 그리드 - 현대적인 카드 디자인 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <div
            key={index}
            onClick={action.onClick}
            className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
          >
            {/* 그라데이션 배경 효과 */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className={`p-3 rounded-xl ${action.iconBg} group-hover:scale-110 transition-all duration-200`}>
                <action.icon className="h-8 w-8" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1 text-gray-900 group-hover:text-gray-800">
                  {action.label}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-700">
                  {action.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 사용자별 맞춤 팁 - 비로그인 사용자만 */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 시작하기</p>
              <p className="text-sm text-blue-700 mb-4">
                로그인하면 더 많은 기능을 사용할 수 있어요!
              </p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-contest-orange to-contest-coral text-white hover:shadow-lg transition-all duration-200"
                onClick={() => navigate('/auth')}
              >
                로그인하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

export default QuickActions;
