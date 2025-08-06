import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Building2, Award, Plus, Sparkles } from 'lucide-react';
import { CrawledContest } from '../types';
import { DEFAULT_DAYS_LEFT_THRESHOLD_URGENT, DEFAULT_DAYS_LEFT_THRESHOLD_WARNING } from '../constants';

interface ContestCardProps {
  contest: CrawledContest;
  onRegister: (contest: CrawledContest) => void;
}

export const ContestCard: React.FC<ContestCardProps> = ({ contest, onRegister }) => {
  const getDaysLeftBadgeClass = (daysLeft: number) => {
    if (daysLeft <= DEFAULT_DAYS_LEFT_THRESHOLD_URGENT) {
      return 'bg-red-100 text-red-700';
    }
    if (daysLeft <= DEFAULT_DAYS_LEFT_THRESHOLD_WARNING) {
      return 'bg-yellow-100 text-yellow-700';
    }
    return 'bg-green-100 text-green-700';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm line-clamp-2">
              {contest.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-contest-orange">
              <Sparkles className="h-3 w-3" />
              AI
            </div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{contest.organization}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                마감: {contest.deadline}
                {contest.daysLeft !== undefined && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${getDaysLeftBadgeClass(contest.daysLeft)}`}>
                    D-{contest.daysLeft}
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Award className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{contest.category}</span>
            </div>
            
            {contest.prize && (
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{contest.prize}</span>
              </div>
            )}
          </div>
          
          {contest.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {contest.description}
            </p>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(contest.url, '_blank')}
            >
              자세히 보기
            </Button>
            <Button
              size="sm"
              onClick={() => onRegister(contest)}
              className="contest-button-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              등록
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 