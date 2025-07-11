import React from 'react';
import { Label } from '@/components/ui/label';

interface ProfileInfoProps {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  displayName,
  bio,
  location,
  website
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">표시 이름</Label>
          <p className="text-gray-900 font-medium">
            {displayName || '설정되지 않음'}
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">위치</Label>
          <p className="text-gray-900 font-medium">
            {location || '설정되지 않음'}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-600">소개</Label>
        <p className="text-gray-900">
          {bio || '설정되지 않음'}
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-600">웹사이트</Label>
        <p className="text-gray-900">
          {website || '설정되지 않음'}
        </p>
      </div>
    </div>
  );
};

export default ProfileInfo; 