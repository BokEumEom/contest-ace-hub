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
}

export class ContestService {
  static async getContests(): Promise<Contest[]> {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getContests:', error);
      return [];
    }
  }

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
          user_id: userId
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

  static async updateContest(id: number, updates: Partial<Contest>): Promise<Contest | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 null 반환
        return null;
      }

      const { data, error } = await supabase
        .from('contests')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating contest:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateContest:', error);
      return null;
    }
  }

  static async deleteContest(id: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 false 반환
        return false;
      }

      const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

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

  static async getContestById(id: string | number): Promise<Contest | null> {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', numericId)
        .single();

      if (error) {
        console.error('Error fetching contest by id:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getContestById:', error);
      return null;
    }
  }
} 