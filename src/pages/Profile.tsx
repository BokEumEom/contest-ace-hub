import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useProfile } from '@/hooks/useProfile';
import { ProfileImageService } from '@/services/profileImageService';
import { useProfileUtils } from '@/hooks/useProfileUtils.tsx';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  AlertCircle,
  Loader2
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

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <User className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              로그인이 필요합니다
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              프로필을 보려면 먼저 로그인해주세요.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              로그인하기
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Skeleton className="h-12 w-full mb-6" />
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              오류가 발생했습니다
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={refresh} className="bg-blue-600 hover:bg-blue-700">
              다시 시도
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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

          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  프로필
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  활동
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="h-5 w-5" />
                      기본 정보
                    </CardTitle>
                    <CardDescription>
                      프로필 정보를 업데이트하세요.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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

                <AccountInfo
                  email={user?.email}
                  joinDate={getJoinDate(user?.created_at)}
                  lastLogin={getLastLogin(user?.last_sign_in_at)}
                />
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <ActivityList
                  activities={activities}
                  getActivityIcon={getActivityIcon}
                  getActivityColor={getActivityColor}
                />
              </TabsContent>
            </Tabs>
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
  );
};

export default Profile; 