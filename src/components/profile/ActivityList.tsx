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
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-5 w-5" />
            최근 활동
          </CardTitle>
          <CardDescription>
            최근 참가한 대회와 활동 내역입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">아직 활동 내역이 없습니다.</p>
            <p className="text-sm text-gray-400 mt-2">
              대회에 참가하면 활동 내역이 표시됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Activity className="h-5 w-5" />
          최근 활동
        </CardTitle>
        <CardDescription>
          최근 참가한 대회와 활동 내역입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className={`flex items-center justify-between p-4 bg-gradient-to-r ${getActivityColor(activity.activity_type)} rounded-lg`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500">
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
              <div className="flex items-center gap-2">
                {activity.points > 0 && (
                  <Badge className="bg-blue-100 text-blue-800">
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