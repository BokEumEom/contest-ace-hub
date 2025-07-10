
import React, { useCallback, useMemo } from 'react';
import { Plus, Search, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const QuickActions = React.memo(() => {
  const navigate = useNavigate();

  // 네비게이션 핸들러들 (메모이제이션)
  const handleNewContest = useCallback(() => navigate('/new-contest'), [navigate]);
  const handleExplore = useCallback(() => navigate('/explore'), [navigate]);
  const handleCalendar = useCallback(() => navigate('/calendar'), [navigate]);
  const handleAIHelper = useCallback(() => navigate('/ai-helper'), [navigate]);

  // 액션 배열 (메모이제이션)
  const actions = useMemo(() => [
    {
      icon: Plus,
      label: '새 공모전 등록',
      description: '참여할 공모전을 추가하세요',
      color: 'orange',
      onClick: handleNewContest
    },
    {
      icon: Search,
      label: '공모전 탐색',
      description: '새로운 기회를 찾아보세요',
      color: 'blue',
      onClick: handleExplore
    },
    {
      icon: Calendar,
      label: '일정 확인',
      description: '마감일과 일정을 관리하세요',
      color: 'coral',
      onClick: handleCalendar
    },
    {
      icon: Sparkles,
      label: 'AI 어시스턴트',
      description: 'AI로 아이디어와 검토를 받아보세요',
      color: 'light-blue',
      onClick: handleAIHelper
    }
  ], [handleNewContest, handleExplore, handleCalendar, handleAIHelper]);

  // 색상 클래스 매핑 (메모이제이션)
  const getColorClasses = useCallback((color: string) => {
    const colorMap = {
      orange: 'hover:bg-contest-orange/5 border-contest-orange/20 hover:border-contest-orange/40',
      blue: 'hover:bg-contest-blue/5 border-contest-blue/20 hover:border-contest-blue/40',
      coral: 'hover:bg-contest-coral/5 border-contest-coral/20 hover:border-contest-coral/40',
      'light-blue': 'hover:bg-contest-light-blue/5 border-contest-light-blue/20 hover:border-contest-light-blue/40'
    };
    return colorMap[color as keyof typeof colorMap];
  }, []);

  // 아이콘 색상 매핑 (메모이제이션)
  const getIconColor = useCallback((color: string) => {
    const colorMap = {
      orange: 'text-contest-orange',
      blue: 'text-contest-blue',
      coral: 'text-contest-coral',
      'light-blue': 'text-contest-light-blue'
    };
    return colorMap[color as keyof typeof colorMap];
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={action.onClick}
          className={`h-auto p-4 flex flex-col items-center text-center space-y-2 transition-all duration-300 cursor-pointer ${getColorClasses(action.color)}`}
        >
          <action.icon className={`h-8 w-8 ${getIconColor(action.color)}`} />
          <div>
            <p className="font-medium text-sm">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
          </div>
        </Button>
      ))}
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

export default QuickActions;
