import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContests } from '@/hooks/useContests';
import { useIsMobile } from '@/hooks/use-mobile';
import ScheduleDialog from '@/components/ScheduleDialog';
import NavigationTransition from '@/components/NavigationTransition';

const MobileCalendar = () => {
  const navigate = useNavigate();
  const { contests } = useContests();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();

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
  const getContestsForDate = useCallback((day: number) => {
    if (!day) return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return contests.filter(contest => contest.deadline === dateStr);
  }, [contests, currentDate]);

  // 해당 날짜의 일정 가져오기
  const getSchedulesForDate = useCallback((day: number) => {
    if (!day) return [];
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return schedules.filter(schedule => schedule.date === dateStr);
  }, [schedules, currentDate]);

  // 월 변경 함수
  const changeMonth = useCallback((increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  }, [currentDate]);

  const handleScheduleAdd = useCallback((schedule: any) => {
    setSchedules(prev => [...prev, schedule]);
  }, []);

  const handleDateSelect = useCallback((day: number) => {
    if (day) {
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(selectedDate);
    }
  }, [currentDate]);

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

  // 선택된 날짜의 이벤트들
  const selectedDateEvents = selectedDate ? [
    ...getContestsForDate(selectedDate.getDate()),
    ...getSchedulesForDate(selectedDate.getDate())
  ] : [];

  if (!isMobile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <NavigationTransition to="/" className="flex items-center space-x-2">
              <div className="bg-contest-gradient p-2 rounded-xl">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-contest-gradient bg-clip-text text-transparent">
                일정 관리
              </h1>
            </NavigationTransition>

            {/* 액션 버튼 */}
            <ScheduleDialog
              trigger={
                <Button size="sm" className="bg-contest-gradient text-white">
                  <Plus className="h-4 w-4 mr-1" />
                  일정 추가
                </Button>
              }
              onScheduleAdd={handleScheduleAdd}
            />
          </div>
        </div>
      </header>

      {/* 컨텐츠 영역 */}
      <div className="pb-20">
        <div className="space-y-4 p-4">
          {/* 월 네비게이션 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonth(-1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonth(1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
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
                const isSelected = selectedDate && day && 
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentDate.getMonth() &&
                  selectedDate.getFullYear() === currentDate.getFullYear();
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    disabled={!day}
                    className={`
                      min-h-12 p-1 text-xs border border-gray-100 rounded-lg
                      ${day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                      ${isToday ? 'ring-2 ring-contest-orange' : ''}
                      ${isSelected ? 'bg-contest-orange/10 ring-2 ring-contest-orange' : ''}
                      ${!day ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    {day && (
                      <>
                        <div className={`font-medium ${isToday || isSelected ? 'text-contest-orange' : 'text-gray-900'}`}>
                          {day}
                        </div>
                        {allEvents.length > 0 && (
                          <div className="mt-1 flex justify-center">
                            <div className="w-2 h-2 bg-contest-orange rounded-full"></div>
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 선택된 날짜의 이벤트 */}
          {selectedDate && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
              </h3>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-contest-orange rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {event.title}
                          </h4>
                          {event.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  이 날에는 일정이 없습니다.
                </p>
              )}
            </div>
          )}

          {/* 이번 달 마감 공모전 */}
          {thisMonthContests.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">이번 달 마감</h3>
              </div>
              <div className="space-y-3">
                {thisMonthContests.slice(0, 3).map(contest => (
                  <div key={contest.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
                      {contest.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>{contest.deadline}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        contest.days_left <= 7 
                          ? 'bg-red-500 text-white' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        D-{contest.days_left}
                      </div>
                    </div>
                  </div>
                ))}
                {thisMonthContests.length > 3 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/contests')}
                  >
                    더보기 ({thisMonthContests.length}개)
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 빠른 액션 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">빠른 작업</h3>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/new-contest')}
                className="w-full bg-contest-gradient text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 공모전 등록
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/explore')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                공모전 탐색
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCalendar; 