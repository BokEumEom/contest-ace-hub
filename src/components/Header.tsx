
import React, { useCallback } from 'react';
import { Search, Calendar, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationDropdown from '@/components/NotificationDropdown';
import NavigationTransition from '@/components/NavigationTransition';
import { useAuth } from './AuthProvider';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // 네비게이션 핸들러들 (메모이제이션)
  const handleHomeClick = useCallback(() => {
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate, location.pathname]);

  const handleSettingsClick = useCallback(() => {
    if (location.pathname !== '/settings') {
      navigate('/settings');
    }
  }, [navigate, location.pathname]);

  const handleProfileClick = useCallback(() => {
    if (location.pathname !== '/profile') {
      navigate('/profile');
    }
  }, [navigate, location.pathname]);

  const handleAuthClick = useCallback(() => {
    if (location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [navigate, location.pathname]);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavigationTransition to="/" className="flex items-center space-x-4 group">
            <div className="bg-contest-gradient p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-contest-gradient bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
              ContestHub
            </h1>
          </NavigationTransition>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="공모전 검색..." 
                className="pl-10 bg-gray-50/50 transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:shadow-lg"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <NotificationDropdown />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-md">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-contest-gradient text-white">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 animate-fade-in" align="end" forceMount>
                  <DropdownMenuItem 
                    onClick={handleSettingsClick}
                    className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>설정</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleProfileClick}
                    className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>프로필</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="transition-all duration-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavigationTransition to="/auth">
                <Button 
                  variant="outline"
                  className="bg-contest-gradient text-white hover:bg-contest-gradient/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  로그인
                </Button>
              </NavigationTransition>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
