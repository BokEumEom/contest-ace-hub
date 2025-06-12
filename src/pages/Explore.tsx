
import React, { useState } from 'react';
import { Search, Filter, Star, Calendar, Trophy } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  // 샘플 공모전 데이터 - 실제로는 API에서 가져올 데이터
  const sampleContests = [
    {
      id: '1',
      title: '2024 스마트시티 아이디어 공모전',
      organization: '과학기술정보통신부',
      deadline: '2024-07-15',
      category: 'IT/기술',
      prize: '대상 1,000만원',
      description: '미래 도시를 위한 혁신적인 스마트시티 솔루션을 제안하세요.',
      participants: 1250,
      daysLeft: 25,
      isBookmarked: false
    },
    {
      id: '2',
      title: '창업 아이디어 경진대회',
      organization: '중소벤처기업부',
      deadline: '2024-06-30',
      category: '창업/비즈니스',
      prize: '대상 500만원',
      description: '혁신적인 창업 아이디어로 미래를 바꿔보세요.',
      participants: 890,
      daysLeft: 10,
      isBookmarked: true
    },
    {
      id: '3',
      title: '친환경 디자인 공모전',
      organization: '환경부',
      deadline: '2024-08-20',
      category: '디자인',
      prize: '대상 300만원',
      description: '지속가능한 미래를 위한 친환경 디자인을 제안하세요.',
      participants: 567,
      daysLeft: 60,
      isBookmarked: false
    }
  ];

  const filteredContests = sampleContests.filter(contest => {
    const matchesSearch = contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contest.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || contest.category === category;
    return matchesSearch && matchesCategory;
  });

  const sortedContests = [...filteredContests].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return a.daysLeft - b.daysLeft;
      case 'participants':
        return b.participants - a.participants;
      case 'prize':
        return parseInt(b.prize.replace(/[^0-9]/g, '')) - parseInt(a.prize.replace(/[^0-9]/g, ''));
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            공모전 탐색
          </h2>
          <p className="text-muted-foreground">
            새로운 기회를 찾아보고 관심있는 공모전을 발견해보세요.
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="공모전 제목이나 주최기관으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="IT/기술">IT/기술</SelectItem>
                <SelectItem value="창업/비즈니스">창업/비즈니스</SelectItem>
                <SelectItem value="디자인">디자인</SelectItem>
                <SelectItem value="마케팅">마케팅</SelectItem>
                <SelectItem value="기획">기획</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">마감일순</SelectItem>
                <SelectItem value="participants">참가자순</SelectItem>
                <SelectItem value="prize">상금순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 공모전 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedContests.map((contest) => (
            <Card key={contest.id} className="contest-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {contest.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{contest.organization}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-contest-orange">
                    <Star className={`h-4 w-4 ${contest.isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {contest.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary">{contest.category}</Badge>
                  <span className="font-medium text-contest-orange">{contest.prize}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>D-{contest.daysLeft}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span>{contest.participants}명 참가</span>
                  </div>
                </div>
                
                <Button className="w-full contest-button-primary">
                  공모전 등록하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedContests.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-muted-foreground">
              다른 검색어나 필터 조건을 시도해보세요.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
