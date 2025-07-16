import React, { useState, useCallback } from 'react';
import { Search, Calendar, Bell, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import NavigationTransition from '@/components/NavigationTransition';

const MobileHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 모바일에서만 표시
  if (!isMobile) return null;

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleSignOut = useCallback(() => {
    signOut();
    setShowMenu(false);
  }, [signOut]);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <NavigationTransition to="/" className="flex items-center space-x-2">
            <div className="bg-contest-gradient p-2 rounded-xl">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-contest-gradient bg-clip-text text-transparent">
              ContestHub
            </h1>
          </NavigationTransition>

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            {/* 검색 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* 알림 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5" />
              {/* 알림 뱃지 */}
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* 메뉴 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* 검색바 */}
        {showSearch && (
          <div className="pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="공모전 검색..."
                className="pl-10 pr-4 h-12 text-base"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* 메뉴 오버레이 */}
        {showMenu && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">메뉴</h3>
              </div>
              
              <div className="p-4 space-y-2">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowMenu(false);
                      }}
                      className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900">프로필</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowMenu(false);
                      }}
                      className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900">설정</div>
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left py-3 px-4 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                    >
                      <div className="font-medium">로그아웃</div>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/auth');
                      setShowMenu(false);
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-900">로그인</div>
                  </button>
                )}
              </div>
            </div>
            
            {/* 배경 클릭으로 닫기 */}
            <div 
              className="absolute inset-0 -z-10"
              onClick={() => setShowMenu(false)}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileHeader; 