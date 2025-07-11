import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Activity, Crown, Loader2 } from 'lucide-react';

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  displayName?: string;
  email?: string;
  isUploading: boolean;
  totalPoints?: number;
  onImageEdit: () => void;
  getUserInitials: (email: string) => string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  displayName,
  email,
  isUploading,
  totalPoints,
  onImageEdit,
  getUserInitials
}) => {
  return (
    <div className="text-center mb-6">
      <div className="relative inline-block">
        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
            {getUserInitials(email || '')}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          variant="secondary"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={onImageEdit}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mt-4">
        {displayName || email?.split('@')[0] || '사용자'}
      </h2>
      <p className="text-gray-600 text-sm">{email}</p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Activity className="h-3 w-3 mr-1" />
          활성
        </Badge>
        {totalPoints && totalPoints > 100 && (
          <Badge variant="outline">
            <Crown className="h-3 w-3 mr-1" />
            프리미엄
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar; 