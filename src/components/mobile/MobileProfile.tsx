import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { useProfileUtils } from '@/hooks/useProfileUtils.tsx';
import { ProfileImageService } from '@/services/profileImageService';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import NavigationTransition from '@/components/NavigationTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Settings, 
  LogOut, 
  Camera, 
  Edit3, 
  Save, 
  X,
  Activity,
  Calendar,
  Trophy,
  Award,
  Clock,
  MapPin,
  Globe,
  Mail,
  Shield,
  Bell,
  HelpCircle,
  FileText
} from 'lucide-react';

const MobileProfile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { 
    profile, 
    statistics, 
    activities, 
    loading, 
    updateProfile, 
    addActivity, 
    refresh 
  } = useProfile();
  
  const {
    getUserInitials,
    getJoinDate,
    getLastLogin,
    getActivityIcon,
    getActivityColor
  } = useProfileUtils();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'settings'>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Update form values when profile loads
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile({
        display_name: displayName,
        bio,
        location,
        website
      });

      await addActivity({
        activity_type: 'contest_created',
        title: '프로필 업데이트',
        description: '프로필 정보를 업데이트했습니다.',
        points: 10,
        metadata: { updated_fields: ['display_name', 'bio', 'location', 'website'] },
        contest_id: null
      });

      toast({
        title: "프로필 업데이트",
        description: "프로필이 성공적으로 업데이트되었습니다."
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "오류",
        description: "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  }, [displayName, bio, location, website, updateProfile, addActivity, toast]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    setIsUploadingImage(true);

    try {
      const resizedFile = await ProfileImageService.resizeImage(file, 400, 400);
      const result = await ProfileImageService.uploadProfileImage(resizedFile);
      
      if (result.success && result.url) {
        await updateProfile({
          avatar_url: result.url
        });

        await addActivity({
          activity_type: 'contest_created',
          title: '프로필 이미지 업데이트',
          description: '프로필 이미지를 변경했습니다.',
          points: 5,
          metadata: { action: 'avatar_update' },
          contest_id: null
        });

        toast({
          title: "이미지 업로드",
          description: "프로필 이미지가 성공적으로 업로드되었습니다."
        });
      } else {
        toast({
          title: "오류",
          description: result.error || "이미지 업로드 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "오류",
        description: "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  }, [updateProfile, addActivity, toast]);

  const handleImageDelete = useCallback(async () => {
    try {
      setIsUploadingImage(true);
      
      await ProfileImageService.deleteProfileImage();
      await updateProfile({
        avatar_url: null
      });

      await addActivity({
        activity_type: 'contest_created',
        title: '프로필 이미지 삭제',
        description: '프로필 이미지를 삭제했습니다.',
        points: 0,
        metadata: { action: 'avatar_delete' },
        contest_id: null
      });

      toast({
        title: "이미지 삭제",
        description: "프로필 이미지가 삭제되었습니다."
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "오류",
        description: "이미지 삭제 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  }, [updateProfile, addActivity, toast]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    event.target.value = '';
  }, [handleImageUpload]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      toast({
        title: "로그아웃",
        description: "성공적으로 로그아웃되었습니다."
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "오류",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  }, [signOut, navigate, toast]);

  if (!isMobile) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-contest-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              프로필을 보려면 먼저 로그인해주세요.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-contest-gradient text-white"
            >
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <NavigationTransition to="/" className="flex items-center space-x-2">
              <div className="bg-contest-gradient p-2 rounded-xl">
                <User className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-contest-gradient bg-clip-text text-transparent">
                프로필
              </h1>
            </NavigationTransition>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('settings')}
              className="h-10 w-10"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 컨텐츠 영역 */}
      <div className="pb-20">
        <div className="space-y-4 p-4">
          {/* 프로필 헤더 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-4 mb-4">
              {/* 아바타 */}
              <div className="relative">
                <div className="w-20 h-20 bg-contest-gradient rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials(profile?.display_name || user.email || '')
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-contest-orange rounded-full flex items-center justify-center text-white shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* 사용자 정보 */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {profile?.display_name || user.email?.split('@')[0] || '사용자'}
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  {user.email}
                </p>
                {profile?.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-contest-orange">
                  {statistics?.total_contests || 0}
                </div>
                <div className="text-xs text-gray-600">공모전</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-contest-coral">
                  {statistics?.completed_contests || 0}
                </div>
                <div className="text-xs text-gray-600">완료</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-contest-blue">
                  {statistics?.total_points || 0}
                </div>
                <div className="text-xs text-gray-600">포인트</div>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-xl p-2 shadow-sm">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-contest-gradient text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="h-4 w-4 mx-auto mb-1" />
                프로필
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-contest-gradient text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Activity className="h-4 w-4 mx-auto mb-1" />
                활동
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-contest-gradient text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4 mx-auto mb-1" />
                설정
              </button>
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* 프로필 정보 */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName" className="text-sm font-medium">
                        표시 이름
                      </Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-1"
                        placeholder="표시할 이름을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-sm font-medium">
                        자기소개
                      </Label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                        placeholder="자기소개를 입력하세요"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium">
                        위치
                      </Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1"
                        placeholder="위치를 입력하세요"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-sm font-medium">
                        웹사이트
                      </Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="mt-1"
                        placeholder="웹사이트 URL을 입력하세요"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSave}
                        className="flex-1 bg-contest-gradient text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile?.display_name && (
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{profile.display_name}</span>
                      </div>
                    )}
                    {profile?.bio && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-sm text-gray-600">{profile.bio}</span>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{profile.location}</span>
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-contest-orange hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 계정 정보 */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">계정 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      가입일: {getJoinDate(user.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      마지막 로그인: {getLastLogin(user.last_sign_in_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">최근 활동</h3>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getActivityColor(activity.activity_type)
                      }`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                          {activity.points > 0 && (
                            <span className="text-xs bg-contest-orange text-white px-2 py-1 rounded">
                              +{activity.points}점
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  아직 활동 내역이 없습니다.
                </p>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* 설정 메뉴 */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">설정</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">알림 설정</span>
                    </div>
                    <span className="text-xs text-gray-500">→</span>
                  </button>
                  <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">개인정보</span>
                    </div>
                    <span className="text-xs text-gray-500">→</span>
                  </button>
                  <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">도움말</span>
                    </div>
                    <span className="text-xs text-gray-500">→</span>
                  </button>
                </div>
              </div>

              {/* 로그아웃 버튼 */}
              <div className="bg-white rounded-xl shadow-sm">
                <button
                  onClick={handleSignOut}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-red-50 text-red-600"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">로그아웃</span>
                  </div>
                  <span className="text-xs">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MobileProfile; 