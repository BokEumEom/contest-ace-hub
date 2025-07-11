import React from 'react';
import { 
  Trophy, 
  Star, 
  Activity, 
  CheckCircle, 
  Award, 
  Users 
} from 'lucide-react';

export const useProfileUtils = () => {
  const getUserInitials = (email: string): string => {
    return email?.charAt(0).toUpperCase() || 'U';
  };

  const getJoinDate = (createdAt?: string): string => {
    if (!createdAt) return '알 수 없음';
    return new Date(createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLastLogin = (lastSignInAt?: string): string => {
    if (!lastSignInAt) return '알 수 없음';
    return new Date(lastSignInAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'contest_created':
        return <Trophy className="h-5 w-5 text-blue-500" />;
      case 'contest_submitted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'contest_completed':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'contest_won':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'contest_participated':
        return <Users className="h-5 w-5 text-indigo-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'contest_created':
        return 'from-blue-50 to-purple-50';
      case 'contest_submitted':
        return 'from-green-50 to-blue-50';
      case 'contest_completed':
        return 'from-purple-50 to-pink-50';
      case 'contest_won':
        return 'from-yellow-50 to-orange-50';
      case 'contest_participated':
        return 'from-indigo-50 to-cyan-50';
      default:
        return 'from-gray-50 to-slate-50';
    }
  };

  return {
    getUserInitials,
    getJoinDate,
    getLastLogin,
    getActivityIcon,
    getActivityColor
  };
}; 