
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Users, Clock, AlertTriangle, ArrowRight, CheckCircle, Star, Zap, Shield, Globe, Award } from 'lucide-react';
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import ContestCard from '@/components/ContestCard';
import QuickActions from '@/components/QuickActions';
import { useContests } from '@/hooks/useContests';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();
  const { contests, loading } = useContests();
  const { user } = useAuth();

  // 로그아웃 상태일 때 랜딩 페이지 표시
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <Header />
        
        {/* Hero Section */}
        <section className="hero-section relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-contest-gradient p-4 rounded-2xl shadow-lg animate-pulse-glow">
                  <Calendar className="h-12 w-12 text-white animate-float" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
                ContestHub
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
                공모전 관리를 한 곳에서<br />
                <span className="gradient-text font-semibold">
                  체계적이고 효율적으로
                </span>
              </p>
              <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto animate-slide-up">
                AI 프롬프트 관리부터 팀 협업까지, 공모전 준비의 모든 과정을 
                ContestHub에서 완벽하게 관리하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="contest-button-primary px-8 py-4 text-lg font-semibold hover-lift"
                >
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 text-lg font-semibold border-2 hover-lift"
                >
                  로그인
                </Button>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-contest-orange/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-contest-coral/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
                모든 공모전 준비를 위한 완벽한 솔루션
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slide-up">
                체계적인 관리부터 AI 활용까지, ContestHub가 도와드립니다
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-shadow animate-scale-in">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 feature-icon">
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">공모전 관리</CardTitle>
                  <CardDescription>
                    마감일, 진행상황, 팀원 관리까지 한눈에
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      실시간 D-day 계산
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      진행상황 추적
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      팀원 역할 관리
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 feature-icon">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">AI 프롬프트 관리</CardTitle>
                  <CardDescription>
                    AI 생성물과 프롬프트를 체계적으로 관리
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      프롬프트 템플릿 저장
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      AI 모델별 최적화
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      생성물과 프롬프트 연결
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 feature-icon">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">팀 협업</CardTitle>
                  <CardDescription>
                    팀원들과 효율적으로 협업하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      팀원 역할 분담
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      진행상황 공유
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      파일 공유 및 관리
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 feature-icon">
                    <Trophy className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">작품 관리</CardTitle>
                  <CardDescription>
                    제출물과 관련 파일을 체계적으로 관리
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      파일 업로드 및 관리
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      작품 설명 작성
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      버전 관리
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 feature-icon">
                    <Clock className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">일정 관리</CardTitle>
                  <CardDescription>
                    중요한 마감일과 일정을 놓치지 마세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      마감일 알림
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      단계별 일정 관리
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      진행상황 추적
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-shadow animate-scale-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 feature-icon">
                    <Shield className="h-8 w-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">보안 및 안전</CardTitle>
                  <CardDescription>
                    안전하고 신뢰할 수 있는 서비스
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      데이터 암호화
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      안전한 파일 저장
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      개인정보 보호
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
                사용자들의 이야기
              </h2>
              <p className="text-xl text-gray-600 animate-slide-up">
                ContestHub로 공모전 준비가 더욱 쉬워졌습니다
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="testimonial-card border-0 shadow-lg bg-white animate-scale-in">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "AI 프롬프트 관리 기능이 정말 유용해요. 생성한 이미지와 프롬프트를 
                    한 곳에서 관리할 수 있어서 작업 효율이 크게 향상되었습니다."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      김
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">김디자이너</p>
                      <p className="text-sm text-gray-500">디자인 공모전 수상자</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="testimonial-card border-0 shadow-lg bg-white animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "팀 프로젝트에서 일정 관리가 훨씬 쉬워졌어요. 마감일 알림과 
                    진행상황 추적으로 놓치는 일이 없어졌습니다."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      이
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">이기획자</p>
                      <p className="text-sm text-gray-500">기획 공모전 참가자</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="testimonial-card border-0 shadow-lg bg-white animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "파일 관리와 작품 설명 작성이 한 곳에서 가능해서 정말 편리해요. 
                    공모전 준비 과정이 체계적으로 정리됩니다."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                      박
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">박개발자</p>
                      <p className="text-sm text-gray-500">개발 공모전 참가자</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section py-20 bg-gradient-to-r from-contest-orange to-contest-coral">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-white/90 mb-8 animate-slide-up">
              무료로 가입하고 공모전 준비를 더욱 효율적으로 만들어보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-semibold bg-white text-contest-orange hover:bg-gray-100 hover-lift"
              >
                무료 회원가입
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-contest-orange hover-lift"
              >
                로그인
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 로그인 상태일 때 기존 대시보드 표시
  // 실시간으로 D-day 계산하는 함수
  const calculateDaysLeft = (deadline: string) => {
    if (!deadline) return 0;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // 통계 계산 (로딩 중이거나 로그아웃 상태가 아닐 때만)
  const inProgressContests = (loading || !user) ? [] : contests.filter(c => c.status === 'in-progress' || c.status === 'preparing');
  const submittedContests = (loading || !user) ? [] : contests.filter(c => c.status === 'submitted' || c.status === 'completed');
  const teamProjects = (loading || !user) ? [] : contests.filter(c => (c.team_members_count || 0) > 1);
  
  // 실시간 계산을 사용한 임박한 마감 공모전 필터링
  const urgentContests = (loading || !user) ? [] : contests.filter(c => {
    const realTimeDaysLeft = calculateDaysLeft(c.deadline);
    return realTimeDaysLeft <= 7 && realTimeDaysLeft > 0;
  });

  const stats = [
    { 
      title: '진행중인 공모전', 
      value: inProgressContests.length.toString(), 
      icon: Calendar, 
      color: 'orange' as const, 
      trend: inProgressContests.length > 0 ? { value: '활발히 진행중', isPositive: true } : undefined
    },
    { 
      title: '제출 완료', 
      value: submittedContests.length.toString(), 
      icon: Trophy, 
      color: 'blue' as const,
      trend: submittedContests.length > 0 ? { value: '완료된 프로젝트', isPositive: true } : undefined
    },
    { 
      title: '팀 프로젝트', 
      value: teamProjects.length.toString(), 
      icon: Users, 
      color: 'coral' as const 
    },
    { 
      title: '임박한 마감', 
      value: urgentContests.length.toString(), 
      icon: Clock, 
      color: 'light-blue' as const, 
      trend: urgentContests.length > 0 ? { value: '주의 필요', isPositive: false } : undefined
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            안녕하세요! 👋
          </h2>
          <p className="text-muted-foreground">
            공모전 정보를 확인하고 새로운 도전을 시작해보세요.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // 로딩 중일 때 스켈레톤 UI
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))
          ) : !user ? (
            // 로그아웃 상태일 때 로그인 유도 메시지
            <div className="col-span-full text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">
                로그인하여 통계를 확인하세요
              </h4>
              <p className="text-muted-foreground mb-4">
                공모전 통계와 진행 상황을 보려면 로그인이 필요합니다.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="contest-button-primary px-6 py-3 rounded-lg font-medium"
              >
                로그인하기
              </button>
            </div>
          ) : (
            stats.map((stat, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <StatsCard {...stat} />
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">빠른 작업</h3>
          <QuickActions />
        </div>

        {/* 임박한 마감 공모전 (우선 표시) */}
        {!loading && urgentContests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-xl font-semibold text-foreground">임박한 마감</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentContests.slice(0, 3).map((contest, index) => (
                <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ContestCard 
                    {...contest} 
                    onClick={() => navigate(`/contest/${contest.id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Contests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              {!user ? '로그인이 필요합니다' : contests.length > 0 ? '모든 공모전' : '등록된 공모전이 없습니다'}
            </h3>
            {user && contests.length > 0 && (
              <button 
                onClick={() => navigate('/contests')}
                className="text-contest-orange font-medium hover:text-contest-coral transition-colors"
              >
                전체 보기 →
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-contest-orange mx-auto mb-4"></div>
              <p className="text-muted-foreground">공모전 정보를 불러오는 중...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">
                로그인이 필요합니다
              </h4>
              <p className="text-muted-foreground mb-6">
                공모전 정보를 보려면 먼저 로그인해주세요.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="contest-button-primary px-6 py-3 rounded-lg font-medium"
              >
                로그인하기
              </button>
            </div>
          ) : contests.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">
                첫 번째 공모전을 등록해보세요!
              </h4>
              <p className="text-muted-foreground mb-6">
                새로운 도전을 시작하고 체계적으로 관리해보세요.
              </p>
              <button
                onClick={() => navigate('/new-contest')}
                className="contest-button-primary px-6 py-3 rounded-lg font-medium"
              >
                공모전 등록하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.slice(0, 6).map((contest, index) => (
                <div key={contest.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ContestCard 
                    {...contest} 
                    onClick={() => navigate(`/contest/${contest.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
