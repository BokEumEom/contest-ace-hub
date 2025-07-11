import React, { useState } from 'react';
import { Plus, Users, UserPlus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TeamMember } from '@/services/contestDetailService';
import { UserSearchModal } from './UserSearchModal';
import { UserSearchResult } from '@/services/userService';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onAddMember: (member: TeamMember) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateMember: (memberId: string, updates: Partial<TeamMember>) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  onAddMember,
  onRemoveMember,
  onUpdateMember
}) => {
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const handleUserSelect = (user: UserSearchResult) => {
    const newMember: TeamMember = {
      id: user.id,
      name: user.display_name,
      email: user.email,
      avatar_url: user.avatar_url,
      role: 'member'
    };
    
    onAddMember(newMember);
    setShowUserSearch(false);
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm('정말로 이 팀원을 제거하시겠습니까?')) {
      onRemoveMember(memberId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader':
        return 'bg-red-100 text-red-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">팀 관리</h2>
                  <p className="text-sm text-gray-600">팀원을 추가하고 관리하세요</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* 팀원 추가 버튼 */}
          <div className="p-6 border-b bg-gray-50">
            <Button
              onClick={() => setShowUserSearch(true)}
              className="w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              팀원 추가
            </Button>
          </div>

          {/* 팀원 목록 */}
          <div className="flex-1 overflow-y-auto p-6">
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">팀원이 없습니다</h3>
                <p className="mt-2 text-gray-600">팀원을 추가하여 협업을 시작하세요.</p>
                <Button
                  onClick={() => setShowUserSearch(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  첫 번째 팀원 추가
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* 아바타 */}
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar_url} alt={member.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* 멤버 정보 */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{member.name}</h3>
                              <Badge className={getRoleColor(member.role)}>
                                {member.role === 'leader' ? '팀장' : '팀원'}
                              </Badge>
                            </div>
                            
                            {member.email && (
                              <p className="text-sm text-gray-600">{member.email}</p>
                            )}
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMember(member.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                총 {teamMembers.length}명의 팀원
              </p>
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 검색 모달 */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleUserSelect}
        title="팀원 검색"
        description="추가할 팀원을 검색하세요"
      />
    </>
  );
}; 