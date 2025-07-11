import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface Activity {
  id: number;
  activity_type: string;
  title: string;
  description: string;
  points: number;
  created_at: string;
}

interface ActivityListProps {
  activities: Activity[];
  getActivityIcon: (type: string) => React.ReactNode;
  getActivityColor: (type: string) => string;
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  getActivityIcon,
  getActivityColor
}) => {
  if (activities.length === 0) {
    return (
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-white/20">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            활동 내역
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            최근 활동을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">아직 활동 내역이 없습니다</h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              대회에 참가하거나 프로필을 업데이트하면 활동 내역이 표시됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-white/20">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          활동 내역
        </CardTitle>
        <CardDescription className="text-gray-600 text-lg">
          최근 활동을 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={`flex items-center justify-between p-6 bg-gradient-to-r ${getActivityColor(activity.activity_type)} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center shadow-sm">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900 text-lg">{activity.title}</p>
                  <p className="text-gray-600">{activity.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activity.points > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 font-semibold px-3 py-1">
                    +{activity.points}점
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityList; 