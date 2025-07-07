import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Globe,
  ExternalLink,
  Calendar,
  Award,
  Users,
  Target,
  Clock
} from 'lucide-react';
import { Contest } from '@/types/contest';

interface ContestHeaderProps {
  contest: Contest;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getDaysLeftColor: (daysLeft: number) => string;
}

export const ContestHeader: React.FC<ContestHeaderProps> = ({
  contest,
  getStatusColor,
  getStatusText,
  getDaysLeftColor
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      {/* 뒤로가기 버튼 */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        돌아가기
      </Button>
      
      {/* 메인 헤더 */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {contest.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>{contest.organization}</span>
              </div>
              {contest.contestUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(contest.contestUrl, '_blank')}
                  className="h-auto p-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`px-3 py-1 ${getStatusColor(contest.status)}`}>
              {getStatusText(contest.status)}
            </Badge>
            <Badge className={`px-3 py-1 ${getDaysLeftColor(contest.daysLeft)}`}>
              D-{contest.daysLeft > 0 ? contest.daysLeft : '마감'}
            </Badge>
          </div>
        </div>

        {/* 핵심 정보 카드 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 마감일 */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">마감일</p>
                  <p className="font-semibold">{contest.deadline}</p>
                </div>
              </div>

              {/* 상금/혜택 */}
              {contest.prize && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">상금/혜택</p>
                    <p className="font-semibold">{contest.prize}</p>
                  </div>
                </div>
              )}

              {/* 팀원 */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">팀원</p>
                  <p className="font-semibold">{contest.teamMembers}명</p>
                </div>
              </div>

              {/* 카테고리 */}
              {contest.category && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">카테고리</p>
                    <p className="font-semibold">{contest.category}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 진행률 */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">진행률</span>
                <span className="text-sm font-semibold">{contest.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-contest-gradient h-3 rounded-full transition-all duration-300"
                  style={{ width: `${contest.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 