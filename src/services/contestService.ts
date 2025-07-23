import { supabase } from '@/lib/supabase';

import { Contest as ContestType } from '@/types/contest';

export interface Contest {
  id?: number;
  user_id?: string;
  title: string;
  organization?: string;
  deadline?: string;
  category?: string;
  prize?: string;
  status?: 'preparing' | 'in-progress' | 'submitted' | 'completed';
  days_left?: number;
  progress?: number;
  team_members_count?: number;
  description?: string;
  requirements?: string[];
  contest_theme?: string;
  submission_format?: string;
  contest_schedule?: string;
  submission_method?: string;
  prize_details?: string;
  result_announcement?: string;
  precautions?: string;
  contest_url?: string;
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  tasks?: import('@/types/contest').Task[]; // 추가
}

export interface UserStatistics {
  id: number;
  user_id: string;
  total_contests: number;
  completed_contests: number;
  won_contests: number;
  total_points: number;
  total_hours: number;
  current_streak: number;
  longest_streak: number;
  achievements: any[];
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export class ContestService {
  // 모든 공모전 조회 (공개 공유)
  static async getAllContests(): Promise<Contest[]> {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all contests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllContests:', error);
      return [];
    }
  }

  // 현재 사용자의 공모전만 조회 (개인 관리용)
  static async getMyContests(): Promise<Contest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my contests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMyContests:', error);
      return [];
    }
  }

  // 기존 메서드 유지 (하위 호환성)
  static async getContests(): Promise<Contest[]> {
    return this.getAllContests();
  }

  // 특정 공모전 조회 (모든 사용자가 접근 가능)
  static async getContestById(id: number): Promise<Contest | null> {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contest:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getContestById:', error);
      return null;
    }
  }

  // 공모전 추가 (인증된 사용자만)
  static async addContest(contest: Omit<Contest, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Contest | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 null 반환
        return null;
      }

      const { data, error } = await supabase
        .from('contests')
        .insert({
          ...contest,
          user_id: userId,
          is_public: contest.is_public ?? true // 기본값은 공개
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding contest:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addContest:', error);
      return null;
    }
  }

  // 공모전 수정 (작성자만)
  static async updateContest(id: number, updates: Partial<Contest>): Promise<Contest | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        console.error('User not authenticated');
        return null;
      }

      // 먼저 공모전이 존재하고 현재 사용자가 소유자인지 확인
      const { data: existingContest, error: fetchError } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching contest for permission check:', fetchError);
        return null;
      }

      if (!existingContest) {
        console.error('Contest not found');
        return null;
      }

      if (existingContest.user_id !== userId) {
        console.error('User does not have permission to update this contest');
        console.error('Contest owner:', existingContest.user_id);
        console.error('Current user:', userId);
        return null;
      }

      // 권한 확인 후 업데이트 실행
      const { data, error } = await supabase
        .from('contests')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating contest:', error);
        console.error('Update data:', updates);
        console.error('Contest ID:', id);
        console.error('User ID:', userId);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateContest:', error);
      return null;
    }
  }

  // 공모전 삭제 (작성자만)
  static async deleteContest(id: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        return false;
      }

      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // 작성자만 삭제 가능

      if (error) {
        console.error('Error deleting contest:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteContest:', error);
      return false;
    }
  }

  // 카테고리별 공모전 조회
  static async getContestsByCategory(category: string): Promise<Contest[]> {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contests by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getContestsByCategory:', error);
      return [];
    }
  }

  // 검색 기능
  static async searchContests(query: string): Promise<Contest[]> {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,organization.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching contests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchContests:', error);
      return [];
    }
  }

  // 사용자별 공모전 조회
  static async getContestsByUser(userId: string): Promise<Contest[]> {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contests by user:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getContestsByUser:', error);
      return [];
    }
  }

  // 사용자 통계 조회 (개인용)
  static async getUserStatistics(): Promise<UserStatistics | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user statistics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserStatistics:', error);
      return null;
    }
  }
} 