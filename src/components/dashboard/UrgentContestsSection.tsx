import React from 'react';
import { AlertTriangle } from 'lucide-react';
import ContestCard from '@/components/ContestCard';

interface Contest {
  id: string | number;
  title: string;
  description?: string;
  deadline?: string;
  status?: string;
  team_members_count?: number;
  [key: string]: any;
}

interface UrgentContestsSectionProps {
  urgentContests: Contest[];
  onContestClick: (contestId: string | number) => void;
}

const UrgentContestsSection: React.FC<UrgentContestsSectionProps> = ({
  urgentContests,
  onContestClick
}) => {
  if (urgentContests.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h3 className="text-xl font-semibold text-foreground">임박한 마감</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {urgentContests.slice(0, 3).map((contest, index) => (
          <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <ContestCard 
              {...contest} 
              onClick={() => onContestClick(contest.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrgentContestsSection; 