import { supabase } from '@/lib/supabase';

export interface FileItem {
  id?: number;
  user_id?: string;
  contest_id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  prompt?: string;
  uploaded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export class FileService {
  // 파일 목록 조회
  static async getFiles(contestId: string): Promise<FileItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 localStorage에서 가져오기
        const stored = localStorage.getItem(`files_${contestId}`);
        return stored ? JSON.parse(stored) : [];
      }

      const { data, error } = await supabase
        .from('contest_files')
        .select('*')
        .eq('contest_id', contestId)
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFiles:', error);
      return [];
    }
  }

  // 파일 업로드
  static async uploadFile(file: File, contestId: string): Promise<FileItem | null> {
    return this.uploadFileWithPrompt(file, contestId, '');
  }

  // 프롬프트와 함께 파일 업로드
  static async uploadFileWithPrompt(file: File, contestId: string, prompt: string): Promise<FileItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // 파일을 Supabase Storage에 업로드
      // 파일명에서 특수문자 제거 및 인코딩
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now()}_${sanitizedFileName}`;
      const filePath = `${userId}/${contestId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contest-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        return null;
      }

      // 파일 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('contest-files')
        .getPublicUrl(filePath);

      const fileItem: Omit<FileItem, 'id' | 'user_id' | 'uploaded_at' | 'created_at' | 'updated_at'> = {
        contest_id: contestId,
        name: file.name,
        url: urlData.publicUrl,
        type: this.getFileType(file.type),
        size: file.size,
        prompt: prompt || undefined
      };

      if (!userId) {
        // 인증된 사용자가 없으면 localStorage에 저장
        const stored = localStorage.getItem(`files_${contestId}`);
        const files = stored ? JSON.parse(stored) : [];
        const newFile = { 
          ...fileItem, 
          id: Date.now(), 
          uploaded_at: new Date().toISOString(),
          // localStorage에서는 URL을 blob URL로 생성
          url: URL.createObjectURL(file)
        };
        files.unshift(newFile);
        localStorage.setItem(`files_${contestId}`, JSON.stringify(files));
        return newFile;
      }

      // DB에 파일 정보 저장
      const { data, error } = await supabase
        .from('contest_files')
        .insert({
          ...fileItem,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving file to database:', error);
        // Storage에서 파일 삭제
        await supabase.storage
          .from('contest-files')
          .remove([filePath]);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in uploadFileWithPrompt:', error);
      return null;
    }
  }

  // 파일 삭제
  static async deleteFile(fileId: number, contestId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 localStorage에서 삭제
        const stored = localStorage.getItem(`files_${contestId}`);
        if (stored) {
          const files = JSON.parse(stored);
          const updatedFiles = files.filter((file: FileItem) => file.id !== fileId);
          localStorage.setItem(`files_${contestId}`, JSON.stringify(updatedFiles));
        }
        return true;
      }

      // DB에서 파일 정보 조회
      const { data: fileData, error: fetchError } = await supabase
        .from('contest_files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !fileData) {
        console.error('Error fetching file for deletion:', fetchError);
        return false;
      }

      // Storage에서 파일 삭제
      // URL에서 파일 경로 추출: https://xxx.supabase.co/storage/v1/object/public/contest-files/userId/contestId/filename
      const urlParts = fileData.url.split('/');
      const filePath = urlParts.slice(-3).join('/'); // userId/contestId/filename
      const { error: storageError } = await supabase.storage
        .from('contest-files')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }

      // DB에서 파일 정보 삭제
      const { error: deleteError } = await supabase
        .from('contest_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting file from database:', deleteError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteFile:', error);
      return false;
    }
  }

  // 파일 타입 결정
  private static getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'document';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'document';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'document';
    return 'document';
  }

  // 파일 프롬프트 업데이트
  static async updateFilePrompt(fileId: number, prompt: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 localStorage에서 업데이트
        const stored = localStorage.getItem(`files_${fileId}`);
        if (stored) {
          const files = JSON.parse(stored);
          const updatedFiles = files.map((file: FileItem) => 
            file.id === fileId ? { ...file, prompt } : file
          );
          localStorage.setItem(`files_${fileId}`, JSON.stringify(updatedFiles));
        }
        return true;
      }

      // DB에서 파일 프롬프트 업데이트
      const { error } = await supabase
        .from('contest_files')
        .update({ prompt })
        .eq('id', fileId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating file prompt:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateFilePrompt:', error);
      return false;
    }
  }

  // AI 생성 파일 타입 설정
  static setAIGeneratedType(fileItem: FileItem): FileItem {
    return {
      ...fileItem,
      type: 'ai-generated'
    };
  }

  // 파일 크기 포맷팅
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 