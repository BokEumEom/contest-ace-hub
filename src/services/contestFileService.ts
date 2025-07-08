import { supabase } from '@/lib/supabase';
import { ContestFile } from '@/types/contest';

export class ContestFileService {
  static async getFiles(contestId: string): Promise<ContestFile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage
        const stored = localStorage.getItem(`contest_files_${contestId}`);
        return stored ? JSON.parse(stored) : [];
      }

      const { data, error } = await supabase
        .from('contest_files')
        .select('*')
        .eq('contest_id', contestId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contest files:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(`contest_files_${contestId}`);
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async saveFile(file: Omit<ContestFile, 'id' | 'uploadedAt'>): Promise<ContestFile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage
        const newFile: ContestFile = {
          ...file,
          id: Date.now().toString(),
          uploadedAt: new Date().toISOString()
        };
        const existing = await this.getFiles(file.contestId);
        const updated = [newFile, ...existing];
        localStorage.setItem(`contest_files_${file.contestId}`, JSON.stringify(updated));
        return newFile;
      }

      const { data, error } = await supabase
        .from('contest_files')
        .insert({
          contest_id: file.contestId,
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id.toString(),
        contestId: data.contest_id.toString(),
        name: data.name,
        url: data.url,
        type: data.type,
        size: data.size,
        uploadedAt: data.uploaded_at
      };
    } catch (error) {
      console.error('Error saving contest file:', error);
      throw error;
    }
  }

  static async deleteFile(fileId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage - would need contestId to implement properly
        throw new Error('Cannot delete file without authentication');
      }

      const { error } = await supabase
        .from('contest_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting contest file:', error);
      throw error;
    }
  }
} 