import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContests } from '@/hooks/useContests';
import ScheduleDialog from '@/components/ScheduleDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileCalendar from '@/components/mobile/MobileCalendar';

const Calendar = () => {
  const navigate = useNavigate();
  const { contests } = useContests();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const isMobile = useIsMobile();

  // 모바일에서는 MobileCalendar 컴포넌트 사용
  if (isMobile) {
    return <MobileCalendar />;
  }

  // 현재 월의 첫날과 마지막날 계산
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // 캘린더 그리드 생성
  const calendarDays = [];
  
  // 이전 달의 빈 칸들
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 현재 달의 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // 해당 날짜의 공모전 일정 가져오기
  const getContestsForDate = (day: number) => {
    if (!day) return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return contests.filter(contest => contest.deadline === dateStr);
  };

  // 해당 날짜의 일정 가져오기
  const getSchedulesForDate = (day: number) => {
    if (!day) return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  // 월 변경 함수
  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const handleScheduleAdd = (schedule: any) => {
    setSchedules(prev => [...prev, schedule]);
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 이번 달 마감되는 공모전들
  const thisMonthContests = contests.filter(contest => {
    const contestDate = new Date(contest.deadline);
    return contestDate.getMonth() === currentDate.getMonth() && 
           contestDate.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            일정 관리
          </h2>
          <p className="text-muted-foreground">
            공모전 마감일과 중요한 일정을 한눈에 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 캘린더 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-contest-orange" />
                    {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* 캘린더 그리드 */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const contestsForDay = day ? getContestsForDate(day) : [];
                    const schedulesForDay = day ? getSchedulesForDate(day) : [];
                    const allEvents = [...contestsForDay, ...schedulesForDay];
                    const isToday = day && 
                      new Date().getDate() === day && 
                      new Date().getMonth() === currentDate.getMonth() &&
                      new Date().getFullYear() === currentDate.getFullYear();
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 border border-gray-100 ${
                          day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                        } ${isToday ? 'ring-2 ring-contest-orange' : ''}`}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium ${isToday ? 'text-contest-orange' : 'text-foreground'}`}>
                              {day}
                            </div>
                            <div className="mt-1 space-y-1">
                              {contestsForDay.slice(0, 1).map(contest => (
                                <div
                                  key={contest.id}
                                  className="text-xs p-1 bg-contest-orange/10 text-contest-orange rounded truncate"
                                  title={contest.title}
                                >
                                  {contest.title}
                                </div>
                              ))}
                              {schedulesForDay.slice(0, 1).map(schedule => (
                                <div
                                  key={schedule.id}
                                  className="text-xs p-1 bg-contest-blue/10 text-contest-blue rounded truncate"
                                  title={schedule.title}
                                >
                                  {schedule.title}
                                </div>
                              ))}
                              {allEvents.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{allEvents.length - 2}개 더
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 이번 달 마감 공모전 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">이번 달 마감</CardTitle>
              </CardHeader>
              <CardContent>
                {thisMonthContests.length > 0 ? (
                  <div className="space-y-3">
                    {thisMonthContests.map(contest => (
                      <div key={contest.id} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {contest.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{contest.deadline}</span>
                          <Badge 
                            variant={contest.days_left <= 7 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            D-{contest.days_left}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    이번 달에 마감되는 공모전이 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 빠른 작업 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScheduleDialog
                  trigger={
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      일정 추가
                    </Button>
                  }
                  onScheduleAdd={handleScheduleAdd}
                />
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={() => navigate('/new-contest')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  공모전 등록
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
