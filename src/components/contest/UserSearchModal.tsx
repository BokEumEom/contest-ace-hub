import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Mail, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserSearchResult } from '@/services/userService';
import { UserService } from '@/services/userService';
import { useDebounce } from '@/hooks/useDebounce';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserSearchResult) => void;
  title?: string;
  description?: string;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  title = "사용자 검색",
  description = "팀원으로 추가할 사용자를 검색하세요"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 디바운스된 검색 쿼리
  const debouncedQuery = useDebounce(searchQuery, 300);

  // 사용자 검색
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await UserService.searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('사용자 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 디바운스된 쿼리로 검색 실행
  useEffect(() => {
    searchUsers(debouncedQuery);
  }, [debouncedQuery, searchUsers]);

  // 사용자 선택 처리
  const handleUserSelect = (user: UserSearchResult) => {
    onSelectUser(user);
    onClose();
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* 검색 입력 */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="이름 또는 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">검색 중...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">검색 결과가 없습니다.</p>
              <p className="text-sm text-gray-500">다른 검색어를 시도해보세요.</p>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <Card
                  key={user.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleUserSelect(user)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* 아바타 */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url} alt={user.display_name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* 사용자 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {user.display_name}
                          </h3>
                          {user.email && (
                            <Badge variant="secondary" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              이메일 있음
                            </Badge>
                          )}
                        </div>

                        {/* 추가 정보 */}
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          {user.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{user.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* 바이오 */}
                        {user.bio && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      {/* 선택 버튼 */}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserSelect(user);
                        }}
                      >
                        선택
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && !searchQuery && (
            <div className="text-center py-8">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">사용자를 검색해보세요.</p>
              <p className="text-sm text-gray-500">이름 또는 이메일로 검색할 수 있습니다.</p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {searchResults.length > 0 && `${searchResults.length}명의 사용자를 찾았습니다.`}
            </p>
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 