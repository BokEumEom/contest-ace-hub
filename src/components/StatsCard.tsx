
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'orange' | 'blue' | 'coral' | 'light-blue';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colorClasses = {
    orange: 'bg-contest-orange/10 text-contest-orange border-contest-orange/20',
    blue: 'bg-contest-blue/10 text-contest-blue border-contest-blue/20',
    coral: 'bg-contest-coral/10 text-contest-coral border-contest-coral/20',
    'light-blue': 'bg-contest-light-blue/10 text-contest-light-blue border-contest-light-blue/20'
  };

  return (
    <div className="contest-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
