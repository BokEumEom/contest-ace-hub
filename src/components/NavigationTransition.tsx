import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface NavigationTransitionProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  loadingText?: string;
}

const NavigationTransition: React.FC<NavigationTransitionProps> = ({
  to,
  children,
  className = "",
  onClick,
  loadingText = "이동 중..."
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 이미 해당 페이지에 있는 경우 네비게이션 하지 않음
    if (location.pathname === to) {
      return;
    }

    // 클릭 핸들러가 있으면 실행
    if (onClick) {
      onClick();
    }

    // 네비게이션 시작
    setIsNavigating(true);

    // 짧은 지연 후 네비게이션 (로딩 상태를 보여주기 위해)
    setTimeout(() => {
      navigate(to);
      setIsNavigating(false);
    }, 200);
  }, [navigate, to, location.pathname, onClick]);

  if (isNavigating) {
    return (
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground animate-fade-in">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{loadingText}</span>
      </div>
    );
  }

  return (
    <div 
      onClick={handleNavigation}
      className={`
        cursor-pointer 
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
        active:scale-95
        ${className}
      `}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
};

export default NavigationTransition; 