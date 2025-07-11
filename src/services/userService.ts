import { supabase } from '@/lib/supabase';

export interface UserSearchResult {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
}

export class UserService {
  // 사용자 검색 (이름 또는 이메일로)
  static async searchUsers(query: string): Promise<UserSearchResult[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      if (!currentUserId) {
        return [];
      }

      // user_profiles 테이블에서 사용자 검색 (이름으로)
      const { data: nameResults, error: nameError } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .neq('user_id', currentUserId)
        .limit(5);

      if (nameError) {
        console.error('Error searching users by name:', nameError);
      }

      // auth.users 테이블에서 이메일로 검색 (가능한 경우)
      let emailResults: any[] = [];
      try {
        const { data: emailData, error: emailError } = await supabase
          .from('user_profiles')
          .select(`
            *,
            auth_users:user_id (
              email
            )
          `)
          .ilike('auth_users.email', `%${query}%`)
          .neq('user_id', currentUserId)
          .limit(5);

        if (!emailError && emailData) {
          emailResults = emailData.map(item => ({
            ...item,
            email: item.auth_users?.email || ''
          }));
        }
      } catch (error) {
        console.log('Email search not available, using name search only');
      }

      // 결과 합치기 및 중복 제거
      const allResults = [...(nameResults || []), ...emailResults];
      const uniqueResults = allResults.filter((item, index, self) => 
        index === self.findIndex(t => t.user_id === item.user_id)
      );

      // 결과 포맷팅
      return uniqueResults.slice(0, 10).map(item => ({
        id: item.user_id,
        email: item.email || '', // 이메일이 있으면 사용, 없으면 빈 문자열
        display_name: item.display_name || '사용자',
        avatar_url: item.avatar_url,
        bio: item.bio,
        location: item.location,
        created_at: item.created_at
      }));
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  }

  // 특정 사용자 정보 가져오기
  static async getUserById(userId: string): Promise<UserSearchResult | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user by ID:', error);
        return null;
      }

      return {
        id: data.user_id,
        email: '', // 보안상 이메일은 제공하지 않음
        display_name: data.display_name || '사용자',
        avatar_url: data.avatar_url,
        bio: data.bio,
        location: data.location,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  // 현재 사용자 정보 가져오기
  static async getCurrentUser(): Promise<UserSearchResult | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching current user:', error);
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        display_name: data?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || '사용자',
        avatar_url: data?.avatar_url || user.user_metadata?.avatar_url,
        bio: data?.bio,
        location: data?.location,
        created_at: data?.created_at || user.created_at
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  // 사용자 존재 여부 확인 (이름으로)
  static async checkUserExists(name: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('display_name', name)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user existence:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      return false;
    }
  }

  // 사용자 존재 여부 확인 (이메일로)
  static async checkUserExistsByEmail(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          auth_users:user_id (
            email
          )
        `)
        .eq('auth_users.email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user existence by email:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkUserExistsByEmail:', error);
      return false;
    }
  }

  // 사용자 프로필 업데이트
  static async updateProfile(profileData: {
    display_name?: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar_url?: string;
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }
} 