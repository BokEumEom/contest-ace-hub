import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ProfileAvatar from './ProfileAvatar';
import ProfileStats from './ProfileStats';
import ProfileActions from './ProfileActions';

interface ProfileSidebarProps {
  avatarUrl?: string | null;
  displayName?: string;
  email?: string;
  isUploading: boolean;
  statistics?: {
    total_contests?: number;
    won_contests?: number;
    total_hours?: number;
    total_points?: number;
  };
  onImageEdit: () => void;
  onEdit: () => void;
  onSignOut: () => void;
  getUserInitials: (email: string) => string;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  avatarUrl,
  displayName,
  email,
  isUploading,
  statistics,
  onImageEdit,
  onEdit,
  onSignOut,
  getUserInitials
}) => {
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <ProfileAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            email={email}
            isUploading={isUploading}
            totalPoints={statistics?.total_points}
            onImageEdit={onImageEdit}
            getUserInitials={getUserInitials}
          />
          
          <ProfileStats
            totalContests={statistics?.total_contests}
            wonContests={statistics?.won_contests}
            totalHours={statistics?.total_hours}
            totalPoints={statistics?.total_points}
          />
          
          <ProfileActions
            onEdit={onEdit}
            onSignOut={onSignOut}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSidebar; 