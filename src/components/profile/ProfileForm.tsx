import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';

interface ProfileFormProps {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  displayName,
  bio,
  location,
  website,
  onDisplayNameChange,
  onBioChange,
  onLocationChange,
  onWebsiteChange,
  onSave,
  onCancel
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-sm font-medium">
            표시 이름
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="표시할 이름을 입력하세요"
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            위치
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="도시, 국가"
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          소개
        </Label>
        <Input
          id="bio"
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="자신을 소개해주세요"
          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website" className="text-sm font-medium">
          웹사이트
        </Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          placeholder="https://your-website.com"
          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-3">
        <Button 
          onClick={onSave}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
        >
          <Save className="h-4 w-4 mr-2" />
          저장
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="px-6"
        >
          <X className="h-4 w-4 mr-2" />
          취소
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm; 