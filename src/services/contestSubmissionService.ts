import { supabase } from '@/lib/supabase';
import { ContestSubmission } from '@/types/contest';

export interface CreateSubmissionData {
  contestId: string;
  title: string;
  description: string;
  fileIds?: number[];
}

export interface UpdateSubmissionData {
  title?: string;
  description?: string;
  fileIds?: number[];
  orderIndex?: number;
}

export class ContestSubmissionService {
  /**
   * 작품 제출 설명을 생성합니다.
   */
  static async createSubmission(submissionData: CreateSubmissionData): Promise<ContestSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the next order index
    const { data: maxOrder } = await supabase
      .from('contest_submissions')
      .select('order_index')
      .eq('contest_id', parseInt(submissionData.contestId))
      .eq('user_id', user.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = maxOrder ? maxOrder.order_index + 1 : 0;

    const { data: result, error } = await supabase
      .from('contest_submissions')
      .insert({
        user_id: user.id,
        contest_id: parseInt(submissionData.contestId),
        title: submissionData.title,
        description: submissionData.description,
        file_ids: submissionData.fileIds || [],
        order_index: nextOrderIndex,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      throw new Error('Failed to create submission');
    }

    return {
      id: result.id.toString(),
      contestId: result.contest_id.toString(),
      title: result.title,
      description: result.description,
      fileIds: result.file_ids || [],
      orderIndex: result.order_index,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  /**
   * 작품 제출 설명을 업데이트합니다.
   */
  static async updateSubmission(submissionId: string, updateData: UpdateSubmissionData): Promise<ContestSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: result, error } = await supabase
      .from('contest_submissions')
      .update({
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description && { description: updateData.description }),
        ...(updateData.fileIds && { file_ids: updateData.fileIds }),
        ...(updateData.orderIndex !== undefined && { order_index: updateData.orderIndex }),
      })
      .eq('id', parseInt(submissionId))
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating submission:', error);
      throw new Error('Failed to update submission');
    }

    return {
      id: result.id.toString(),
      contestId: result.contest_id.toString(),
      title: result.title,
      description: result.description,
      fileIds: result.file_ids || [],
      orderIndex: result.order_index,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  /**
   * 특정 작품 제출 설명을 가져옵니다.
   */
  static async getSubmission(submissionId: string): Promise<ContestSubmission | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: result, error } = await supabase
      .from('contest_submissions')
      .select()
      .eq('id', parseInt(submissionId))
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching submission:', error);
      throw new Error('Failed to fetch submission');
    }

    return {
      id: result.id.toString(),
      contestId: result.contest_id.toString(),
      title: result.title,
      description: result.description,
      fileIds: result.file_ids || [],
      orderIndex: result.order_index,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  }

  /**
   * 대회의 모든 작품 제출 설명을 가져옵니다.
   */
  static async getSubmissions(contestId: string): Promise<ContestSubmission[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: results, error } = await supabase
      .from('contest_submissions')
      .select()
      .eq('contest_id', parseInt(contestId))
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch submissions');
    }

    return (results || []).map(result => ({
      id: result.id.toString(),
      contestId: result.contest_id.toString(),
      title: result.title,
      description: result.description,
      fileIds: result.file_ids || [],
      orderIndex: result.order_index,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }));
  }

  /**
   * 파일과 연결된 작품 제출 설명들을 가져옵니다.
   */
  static async getSubmissionsByFile(contestId: string, fileId: number): Promise<ContestSubmission[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: results, error } = await supabase
      .from('contest_submissions')
      .select()
      .eq('contest_id', parseInt(contestId))
      .eq('user_id', user.id)
      .contains('file_ids', [fileId])
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching submissions by file:', error);
      throw new Error('Failed to fetch submissions by file');
    }

    return (results || []).map(result => ({
      id: result.id.toString(),
      contestId: result.contest_id.toString(),
      title: result.title,
      description: result.description,
      fileIds: result.file_ids || [],
      orderIndex: result.order_index,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    }));
  }

  /**
   * 작품 제출 설명을 삭제합니다.
   */
  static async deleteSubmission(submissionId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('contest_submissions')
      .delete()
      .eq('id', parseInt(submissionId))
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting submission:', error);
      throw new Error('Failed to delete submission');
    }
  }

  /**
   * 작품 제출 설명들의 순서를 업데이트합니다.
   */
  static async updateSubmissionOrder(contestId: string, submissionIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update order for each submission
    for (let i = 0; i < submissionIds.length; i++) {
      const { error } = await supabase
        .from('contest_submissions')
        .update({ order_index: i })
        .eq('id', parseInt(submissionIds[i]))
        .eq('contest_id', parseInt(contestId))
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating submission order:', error);
        throw new Error('Failed to update submission order');
      }
    }
  }

  /**
   * 파일을 작품 제출 설명에 연결합니다.
   */
  static async connectFileToSubmission(submissionId: string, fileId: number): Promise<ContestSubmission> {
    const submission = await this.getSubmission(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const updatedFileIds = [...submission.fileIds, fileId];
    return await this.updateSubmission(submissionId, { fileIds: updatedFileIds });
  }

  /**
   * 파일을 작품 제출 설명에서 연결 해제합니다.
   */
  static async disconnectFileFromSubmission(submissionId: string, fileId: number): Promise<ContestSubmission> {
    const submission = await this.getSubmission(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const updatedFileIds = submission.fileIds.filter(id => id !== fileId);
    return await this.updateSubmission(submissionId, { fileIds: updatedFileIds });
  }
} 