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
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        const savedContests = localStorage.getItem('contests');
        return savedContests ? JSON.parse(savedContests) : [];
      }

      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('user_id', userId)
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
        // Fallback to localStorage if no authenticated user
        const savedContests = localStorage.getItem('contests');
        const contests = savedContests ? JSON.parse(savedContests) : [];
        const newContest = { ...contest, id: Date.now() };
        contests.unshift(newContest);
        localStorage.setItem('contests', JSON.stringify(contests));
        return newContest;
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
        // Fallback to localStorage if no authenticated user
        const savedContests = localStorage.getItem('contests');
        const contests = savedContests ? JSON.parse(savedContests) : [];
        const index = contests.findIndex((c: Contest) => c.id === id);
        if (index !== -1) {
          contests[index] = { ...contests[index], ...updates };
          localStorage.setItem('contests', JSON.stringify(contests));
          return contests[index];
        }
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
        // Fallback to localStorage if no authenticated user
        const savedContests = localStorage.getItem('contests');
        const contests = savedContests ? JSON.parse(savedContests) : [];
        const filteredContests = contests.filter((c: Contest) => c.id !== id);
        localStorage.setItem('contests', JSON.stringify(filteredContests));
        return true;
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
} 