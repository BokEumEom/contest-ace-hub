import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { ProfileImageService } from '@/services/profileImageService';
import { useProfileUtils } from '@/hooks/useProfileUtils.tsx';
import Header from '@/components/Header';
import PageTransition from '@/components/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  Activity
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import refactored components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileInfo from '@/components/profile/ProfileInfo';
import AccountInfo from '@/components/profile/AccountInfo';
import ActivityList from '@/components/profile/ActivityList';
import ImageUploadDialog from '@/components/profile/ImageUploadDialog';

// Animation constants for better maintainability
const ANIMATION_DELAY_MS = 150;
const HOVER_TRANSITION_DURATION = 'duration-300';
const FOCUS_TRANSITION_DURATION = 'duration-200';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { 
    profile, 
    statistics, 
    activities, 
    loading, 
    error, 
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
  const [showImageDialog, setShowImageDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form values when profile loads
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  const handleSave = async () => {
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
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploadingImage(true);
    setShowImageDialog(false);

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
  };

  const handleImageDelete = async () => {
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
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    event.target.value = '';
  };

  const handleSignOut = async () => {
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
  };

  // Enhanced loading state with better visual design
  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <Header />
          <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-8">
              {/* Enhanced icon with animation */}
              <div className="relative mx-auto w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
                <User className="h-16 w-16 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-bounce" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  로그인이 필요합니다
                </h1>
                <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
                  프로필을 보려면 먼저 로그인해주세요.
                </p>
              </div>
              
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg"
              >
                로그인하기
              </Button>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition isLoading={loading}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
        {/* Enhanced background with animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/5 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <Header />
        
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileHeader />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* Enhanced sidebar with better visual design */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ProfileSidebar
                  avatarUrl={profile?.avatar_url}
                  displayName={profile?.display_name}
                  email={user?.email}
                  isUploading={isUploadingImage}
                  statistics={statistics}
                  onImageEdit={() => setShowImageDialog(true)}
                  onEdit={() => setIsEditing(true)}
                  onSignOut={handleSignOut}
                  getUserInitials={getUserInitials}
                />
              </div>
            </div>

            {/* Enhanced main content area */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {/* Enhanced tabs with better styling */}
                <Tabs defaultValue="profile" className="space-y-8">
                  <div className="relative">
                    <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-1 h-16">
                      <TabsTrigger 
                        value="profile" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105"
                      >
                        <User className="h-5 w-5 mr-2" />
                        프로필
                      </TabsTrigger>
                      <TabsTrigger 
                        value="activity" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105"
                      >
                        <Activity className="h-5 w-5 mr-2" />
                        활동
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="profile" className="space-y-8">
                    {/* Enhanced profile card with better visual hierarchy */}
                    <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-white/20">
                        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          기본 정보
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-lg">
                          프로필 정보를 업데이트하세요.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 space-y-8">
                        {isEditing ? (
                          <ProfileForm
                            displayName={displayName}
                            bio={bio}
                            location={location}
                            website={website}
                            onDisplayNameChange={setDisplayName}
                            onBioChange={setBio}
                            onLocationChange={setLocation}
                            onWebsiteChange={setWebsite}
                            onSave={handleSave}
                            onCancel={() => setIsEditing(false)}
                          />
                        ) : (
                          <ProfileInfo
                            displayName={profile?.display_name}
                            bio={profile?.bio}
                            location={profile?.location}
                            website={profile?.website}
                          />
                        )}
                      </CardContent>
                    </Card>

                    {/* AccountInfo component already includes its own Card */}
                    <AccountInfo
                      email={user?.email}
                      joinDate={getJoinDate(user?.created_at)}
                      lastLogin={getLastLogin(user?.last_sign_in_at)}
                    />
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-8">
                    {/* ActivityList component already includes its own Card */}
                    <ActivityList
                      activities={activities}
                      getActivityIcon={getActivityIcon}
                      getActivityColor={getActivityColor}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <ImageUploadDialog
            open={showImageDialog}
            onOpenChange={setShowImageDialog}
            isUploading={isUploadingImage}
            hasAvatar={!!profile?.avatar_url}
            onImageSelect={() => fileInputRef.current?.click()}
            onImageDelete={handleImageDelete}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </main>
      </div>
    </PageTransition>
  );
};

export default Profile; 