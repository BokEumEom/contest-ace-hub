import { supabase } from '@/lib/supabase';
import { ContestResult, ContestResultFormData } from '@/types/contest';

export class ContestResultService {
  // 공모전 결과 목록 조회
  static async getResults(contestId: number): Promise<ContestResult[]> {
    try {
      const { data, error } = await supabase
        .from('contest_results')
        .select('*')
        .eq('contest_id', contestId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contest results:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getResults:', error);
      return [];
    }
  }

  // 특정 결과 조회
  static async getResult(resultId: number): Promise<ContestResult | null> {
    try {
      const { data, error } = await supabase
        .from('contest_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (error) {
        console.error('Error fetching contest result:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getResult:', error);
      return null;
    }
  }

  // 결과 추가
  static async addResult(contestId: number, resultData: ContestResultFormData): Promise<ContestResult | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 공모전 소유자 확인
      const { data: contest, error: contestError } = await supabase
        .from('contests')
        .select('user_id')
        .eq('id', contestId)
        .single();

      if (contestError || !contest) {
        throw new Error('Contest not found');
      }

      if (contest.user_id !== user.id) {
        throw new Error('Only contest owner can add results');
      }

      const newResult = {
        contest_id: contestId,
        description: resultData.description || null,
        status: resultData.status,
        prize_amount: resultData.prize_amount || null,
        feedback: resultData.feedback || null,
        announcement_date: resultData.announcement_date,
        file_ids: resultData.file_ids || null,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('contest_results')
        .insert(newResult)
        .select()
        .single();

      if (error) {
        console.error('Error adding contest result:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addResult:', error);
      throw error;
    }
  }

  // 결과 수정
  static async updateResult(resultId: number, updates: Partial<ContestResult>): Promise<ContestResult | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 권한 확인
      const { data: existingResult, error: fetchError } = await supabase
        .from('contest_results')
        .select('contest_id')
        .eq('id', resultId)
        .single();

      if (fetchError || !existingResult) {
        throw new Error('Result not found');
      }

      // 공모전 소유자 확인
      const { data: contest, error: contestError } = await supabase
        .from('contests')
        .select('user_id')
        .eq('id', existingResult.contest_id)
        .single();

      if (contestError || !contest) {
        throw new Error('Contest not found');
      }

      if (contest.user_id !== user.id) {
        throw new Error('Only contest owner can update results');
      }

      const { data, error } = await supabase
        .from('contest_results')
        .update(updates)
        .eq('id', resultId)
        .select()
        .single();

      if (error) {
        console.error('Error updating contest result:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateResult:', error);
      throw error;
    }
  }

  // 결과 삭제
  static async deleteResult(resultId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 권한 확인
      const { data: existingResult, error: fetchError } = await supabase
        .from('contest_results')
        .select('contest_id')
        .eq('id', resultId)
        .single();

      if (fetchError || !existingResult) {
        throw new Error('Result not found');
      }

      // 공모전 소유자 확인
      const { data: contest, error: contestError } = await supabase
        .from('contests')
        .select('user_id')
        .eq('id', existingResult.contest_id)
        .single();

      if (contestError || !contest) {
        throw new Error('Contest not found');
      }

      if (contest.user_id !== user.id) {
        throw new Error('Only contest owner can delete results');
      }

      const { error } = await supabase
        .from('contest_results')
        .delete()
        .eq('id', resultId);

      if (error) {
        console.error('Error deleting contest result:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteResult:', error);
      throw error;
    }
  }

  // 결과 통계 조회
  static async getResultStats(contestId: number): Promise<{
    total_results: number;
    winners_count: number;
    runner_ups_count: number;
    shortlisted_count: number;
    participants_count: number;
    honorable_mentions_count: number;
    average_score: number;
  }> {
    try {
      const results = await this.getResults(contestId);
      
      const stats = {
        total_results: results.length,
        winners_count: results.filter(r => r.status === 'awarded_1st').length,
        runner_ups_count: results.filter(r => r.status === 'awarded_2nd').length,
        shortlisted_count: results.filter(r => r.status === 'final_selected').length,
        participants_count: results.filter(r => r.status === 'submitted').length,
        honorable_mentions_count: results.filter(r => r.status === 'special_award').length,
        average_score: 0
      };

      // 점수는 더 이상 사용하지 않으므로 0으로 설정
      stats.average_score = 0;

      return stats;
    } catch (error) {
      console.error('Error in getResultStats:', error);
      return {
        total_results: 0,
        winners_count: 0,
        runner_ups_count: 0,
        shortlisted_count: 0,
        participants_count: 0,
        honorable_mentions_count: 0,
        average_score: 0
      };
    }
  }
}
