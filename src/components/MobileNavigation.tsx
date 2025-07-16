import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, User, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const tabs = [
    { id: 'home', label: '홈', icon: Home, path: '/' },
    { id: 'explore', label: '탐색', icon: Search, path: '/explore' },
    { id: 'calendar', label: '일정', icon: Calendar, path: '/calendar' },
    { id: 'profile', label: '프로필', icon: User, path: '/profile' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`
                mobile-nav-tab
                ${active 
                  ? 'mobile-nav-tab-active' 
                  : 'mobile-nav-tab-inactive'
                }
                min-w-[60px]
              `}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">
                {tab.label}
              </span>
              
              {/* 활성 표시 */}
              {active && (
                <div className="mobile-nav-indicator" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation; 