import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  isLoading = false,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 페이지 진입 시 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 로딩 상태 컴포넌트
  const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        <div className="animate-spin">
          <Loader2 className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-lg text-gray-600 animate-fade-in-delayed">
          로딩 중...
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div 
      className={`
        transition-all duration-500 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95'
        }
        ${className}
      `}
      style={{
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition; 