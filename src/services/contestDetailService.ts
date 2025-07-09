import { supabase } from '@/lib/supabase';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface Schedule {
  id: string;
  title: string;
  date: string;
  description?: string;
  completed: boolean;
}

export interface ContestDetail {
  id?: number;
  user_id?: string;
  contest_id: number;
  detail_type: 'team_members' | 'schedules';
  data: TeamMember[] | Schedule[];
  created_at?: string;
  updated_at?: string;
}

export class ContestDetailService {
  static async getTeamMembers(contestId: number): Promise<TeamMember[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        const saved = localStorage.getItem(`teamMembers_${contestId}`);
        return saved ? JSON.parse(saved) : [];
      }

      const { data, error } = await supabase
        .from('contest_details')
        .select('data')
        .eq('user_id', userId)
        .eq('contest_id', contestId)
        .eq('detail_type', 'team_members')
        .maybeSingle();

      if (error) {
        console.error('Error fetching team members:', error);
        // 인증 오류나 권한 오류인 경우 localStorage로 fallback
        const saved = localStorage.getItem(`teamMembers_${contestId}`);
        return saved ? JSON.parse(saved) : [];
      }

      // If no data found, return empty array
      return data?.data as TeamMember[] || [];
    } catch (error) {
      console.error('Error in getTeamMembers:', error);
      return [];
    }
  }

  static async saveTeamMembers(contestId: number, teamMembers: TeamMember[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        localStorage.setItem(`teamMembers_${contestId}`, JSON.stringify(teamMembers));
        return true;
      }

      const { error } = await supabase
        .from('contest_details')
        .upsert({
          user_id: userId,
          contest_id: contestId,
          detail_type: 'team_members',
          data: teamMembers
        });

      if (error) {
        console.error('Error saving team members:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveTeamMembers:', error);
      return false;
    }
  }

  static async getSchedules(contestId: number): Promise<Schedule[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        const saved = localStorage.getItem(`schedules_${contestId}`);
        return saved ? JSON.parse(saved) : [];
      }

      const { data, error } = await supabase
        .from('contest_details')
        .select('data')
        .eq('user_id', userId)
        .eq('contest_id', contestId)
        .eq('detail_type', 'schedules')
        .maybeSingle();

      if (error) {
        console.error('Error fetching schedules:', error);
        // 인증 오류나 권한 오류인 경우 localStorage로 fallback
        const saved = localStorage.getItem(`schedules_${contestId}`);
        return saved ? JSON.parse(saved) : [];
      }

      // If no data found, return empty array
      return data?.data as Schedule[] || [];
    } catch (error) {
      console.error('Error in getSchedules:', error);
      return [];
    }
  }

  static async saveSchedules(contestId: number, schedules: Schedule[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        localStorage.setItem(`schedules_${contestId}`, JSON.stringify(schedules));
        return true;
      }

      const { error } = await supabase
        .from('contest_details')
        .upsert({
          user_id: userId,
          contest_id: contestId,
          detail_type: 'schedules',
          data: schedules
        });

      if (error) {
        console.error('Error saving schedules:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveSchedules:', error);
      return false;
    }
  }
} 