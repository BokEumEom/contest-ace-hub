
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'orange' | 'blue' | 'coral' | 'light-blue';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = React.memo(({ title, value, icon: Icon, trend, color, onClick }) => {
  const colorClasses = {
    orange: 'bg-gradient-to-br from-contest-orange/10 to-contest-orange/5 text-contest-orange border-contest-orange/20',
    blue: 'bg-gradient-to-br from-contest-blue/10 to-contest-blue/5 text-contest-blue border-contest-blue/20',
    coral: 'bg-gradient-to-br from-contest-coral/10 to-contest-coral/5 text-contest-coral border-contest-coral/20',
    'light-blue': 'bg-gradient-to-br from-contest-light-blue/10 to-contest-light-blue/5 text-contest-light-blue border-contest-light-blue/20'
  };

  const iconColorClasses = {
    orange: 'bg-contest-orange/10 text-contest-orange',
    blue: 'bg-contest-blue/10 text-contest-blue',
    coral: 'bg-contest-coral/10 text-contest-coral',
    'light-blue': 'bg-contest-light-blue/10 text-contest-light-blue'
  };

  return (
    <div 
      className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconColorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.value}</span>
          </div>
          <span className="text-xs text-muted-foreground">vs 지난주</span>
        </div>
      )}
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
