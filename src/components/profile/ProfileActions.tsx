import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Edit3, LogOut } from 'lucide-react';

interface ProfileActionsProps {
  onEdit: () => void;
  onSignOut: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ onEdit, onSignOut }) => {
  return (
    <>
      <Separator className="my-6" />
      
      {/* Quick Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onEdit}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          프로필 편집
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </>
  );
};

export default ProfileActions; 