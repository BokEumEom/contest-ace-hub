import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Trophy, Star, Clock, Zap } from 'lucide-react';

interface ProfileStatsProps {
  totalContests?: number;
  wonContests?: number;
  totalHours?: number;
  totalPoints?: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  totalContests = 0,
  wonContests = 0,
  totalHours = 0,
  totalPoints = 0
}) => {
  return (
    <>
      <Separator className="my-6" />
      
      {/* Quick Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">참가 대회</span>
          </div>
          <span className="font-semibold text-gray-900">{totalContests}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">수상</span>
          </div>
          <span className="font-semibold text-gray-900">{wonContests}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">활동 시간</span>
          </div>
          <span className="font-semibold text-gray-900">{totalHours}h</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-gray-600">포인트</span>
          </div>
          <span className="font-semibold text-gray-900">{totalPoints}</span>
        </div>
      </div>
    </>
  );
};

export default ProfileStats; 