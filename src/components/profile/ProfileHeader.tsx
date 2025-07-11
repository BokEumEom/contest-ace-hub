import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProfileHeaderProps {
  title?: string;
  description?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  title = "프로필", 
  description = "계정 정보를 관리하고 개인 설정을 변경하세요." 
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-xl transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로 가기
        </Button>
      </div>

      {/* Profile Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-lg text-gray-600">{description}</p>
      </div>
    </>
  );
};

export default ProfileHeader; 