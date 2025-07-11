import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: number;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  social_links: Record<string, string>;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
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

export interface UserActivity {
  id: number;
  user_id: string;
  contest_id: number | null;
  activity_type: 'contest_created' | 'contest_submitted' | 'contest_completed' | 'contest_won' | 'contest_participated';
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  points: number;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('프로필을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // Fetch user statistics
  const fetchStatistics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Fetch user activities
  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          contests (
            id,
            title,
            organization,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  // Create or update profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // 먼저 기존 프로필이 있는지 확인
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let result;
      
      if (existingProfile) {
        // 기존 프로필이 있으면 UPDATE
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }
        result = data;
      } else {
        // 기존 프로필이 없으면 INSERT
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          throw error;
        }
        result = data;
      }

      setProfile(result);
      return result;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  // Add activity
  const addActivity = async (activityData: Omit<UserActivity, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          ...activityData
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh activities
      await fetchActivities();
      return data;
    } catch (err) {
      console.error('Error adding activity:', err);
      throw err;
    }
  };

  // Update statistics
  const updateStatistics = async (statsData: Partial<UserStatistics>) => {
    if (!user) return;

    try {
      // 먼저 기존 통계가 있는지 확인
      const { data: existingStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let result;
      
      if (existingStats) {
        // 기존 통계가 있으면 UPDATE
        const { data, error } = await supabase
          .from('user_statistics')
          .update({
            ...statsData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }
        result = data;
      } else {
        // 기존 통계가 없으면 INSERT
        const { data, error } = await supabase
          .from('user_statistics')
          .insert({
            user_id: user.id,
            ...statsData,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          throw error;
        }
        result = data;
      }

      setStatistics(result);
      return result;
    } catch (err) {
      console.error('Error updating statistics:', err);
      throw err;
    }
  };

  // Initialize profile if it doesn't exist
  const initializeProfile = async () => {
    if (!user) return;

    try {
      // 먼저 기존 프로필이 있는지 확인
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // 프로필이 없으면 생성
      if (!existingProfile) {
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '사용자',
            bio: user.user_metadata?.bio || null,
            location: user.user_metadata?.location || null,
            website: user.user_metadata?.website || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            social_links: {},
            preferences: {}
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating profile:', error);
          return;
        }

        setProfile(data);
      }
    } catch (err) {
      console.error('Error initializing profile:', err);
    }
  };

  // Initialize statistics if it doesn't exist
  const initializeStatistics = async () => {
    if (!user) return;

    try {
      // 먼저 기존 통계가 있는지 확인
      const { data: existingStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // 통계가 없으면 생성
      if (!existingStats) {
        const { data, error } = await supabase
          .from('user_statistics')
          .insert({
            user_id: user.id,
            total_contests: 0,
            completed_contests: 0,
            won_contests: 0,
            total_points: 0,
            total_hours: 0,
            current_streak: 0,
            longest_streak: 0,
            achievements: []
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating statistics:', error);
          return;
        }

        setStatistics(data);
      }
    } catch (err) {
      console.error('Error initializing statistics:', err);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 먼저 초기화 (프로필과 통계가 없으면 생성)
        await Promise.all([
          initializeProfile(),
          initializeStatistics()
        ]);

        // 그 다음 데이터 로드
        await Promise.all([
          fetchProfile(),
          fetchStatistics(),
          fetchActivities()
        ]);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return {
    profile,
    statistics,
    activities,
    loading,
    error,
    updateProfile,
    addActivity,
    updateStatistics,
    refresh: () => {
      fetchProfile();
      fetchStatistics();
      fetchActivities();
    }
  };
}; 