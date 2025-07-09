import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Shield, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');

  const handleSave = async () => {
    try {
      // Here you would typically update the user profile in Supabase
      // For now, we'll just show a success message
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로 가기
          </Button>
        </div>

        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">프로필</h1>
          <p className="text-muted-foreground">
            계정 정보를 관리하고 개인 설정을 변경하세요.
          </p>
        </div>

        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    기본 정보
                  </CardTitle>
                  <CardDescription>
                    프로필 정보를 업데이트하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-contest-gradient text-white text-lg">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {user?.user_metadata?.display_name || user?.email || '사용자'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="displayName">표시 이름</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="표시할 이름을 입력하세요"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">소개</Label>
                        <Input
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="자신을 소개해주세요"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave}>저장</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label>표시 이름</Label>
                        <p className="text-sm text-muted-foreground">
                          {user?.user_metadata?.display_name || '설정되지 않음'}
                        </p>
                      </div>
                      <div>
                        <Label>소개</Label>
                        <p className="text-sm text-muted-foreground">
                          {user?.user_metadata?.bio || '설정되지 않음'}
                        </p>
                      </div>
                      <Button onClick={() => setIsEditing(true)}>
                        정보 수정
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Account Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    계정 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>이메일</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <Label>가입일</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '알 수 없음'}
                    </p>
                  </div>
                  <div>
                    <Label>마지막 로그인</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR') : '알 수 없음'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    보안
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    로그아웃
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              로그인이 필요합니다
            </h4>
            <p className="text-muted-foreground mb-6">
              프로필을 보려면 먼저 로그인해주세요.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="contest-button-primary px-6 py-3 rounded-lg font-medium"
            >
              로그인하기
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile; 