
import React from 'react';
import { Bell, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-contest-gradient p-2 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-contest-gradient bg-clip-text text-transparent">
              ContestHub
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="공모전 검색..." 
                className="pl-10 bg-gray-50/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-contest-orange rounded-full"></span>
            </Button>
            <div className="h-8 w-8 bg-contest-gradient rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">김</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
