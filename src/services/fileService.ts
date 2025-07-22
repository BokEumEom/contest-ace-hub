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
  canEdit?: boolean; // 편집 권한
  canDelete?: boolean; // 삭제 권한
}

export class FileService {
  // 파일 목록 조회
  static async getFiles(contestId: string): Promise<FileItem[]> {
    try {
      // 인증 상태 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // 인증되지 않은 사용자는 빈 배열 반환
        return [];
      }

      // 먼저 공모전 정보를 조회하여 작성자 확인
      const { data: contestData, error: contestError } = await supabase
        .from('contests')
        .select('user_id')
        .eq('id', contestId)
        .single();

      if (contestError || !contestData) {
        console.error('Error fetching contest:', contestError);
        return [];
      }

      // 현재 사용자가 공모전 작성자인지 확인
      const isContestOwner = contestData.user_id === user.id;

      // 파일 조회 - 모든 인증된 사용자가 조회 가능
      const { data, error } = await supabase
        .from('contest_files')
        .select('*')
        .eq('contest_id', contestId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }

      // 권한 설정: 작성자는 모든 파일 관리 가능, 다른 사용자는 자신이 업로드한 파일만
      const filesWithPermissions = (data || []).map(file => ({
        ...file,
        canEdit: isContestOwner || file.user_id === user.id, // 작성자이거나 자신이 업로드한 파일
        canDelete: isContestOwner || file.user_id === user.id, // 작성자이거나 자신이 업로드한 파일
      }));

      return filesWithPermissions;
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
        // 인증된 사용자가 없으면 null 반환
        return null;
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
      console.log(`Starting file deletion for fileId: ${fileId}, contestId: ${contestId}`);
      
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        console.error('No authenticated user found');
        return false;
      }

      console.log(`Authenticated user: ${userId}`);

      // 공모전 작성자 확인
      const { data: contestData, error: contestError } = await supabase
        .from('contests')
        .select('user_id')
        .eq('id', contestId)
        .single();

      if (contestError || !contestData) {
        console.error('Error fetching contest:', contestError);
        return false;
      }

      const isContestOwner = contestData.user_id === userId;
      console.log(`Is contest owner: ${isContestOwner}`);

      // DB에서 파일 정보 조회
      const { data: fileData, error: fetchError } = await supabase
        .from('contest_files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (fetchError || !fileData) {
        console.error('Error fetching file for deletion:', fetchError);
        return false;
      }

      console.log(`File data:`, fileData);

      // 권한 확인: 작성자이거나 파일 업로더만 삭제 가능
      const canDelete = isContestOwner || fileData.user_id === userId;
      if (!canDelete) {
        console.error('User does not have permission to delete this file');
        console.error(`User ID: ${userId}, File user ID: ${fileData.user_id}, Is owner: ${isContestOwner}`);
        return false;
      }

      console.log('Permission check passed, proceeding with deletion');

      // Storage에서 파일 삭제
      let storageDeleted = false;
      try {
        console.log('Deleting file from storage:', fileData.url);

        // URL에서 파일 경로 추출 개선
        const urlParts = fileData.url.split('/');
        const bucketIndex = urlParts.findIndex(part => part === 'contest-files');
        
        if (bucketIndex === -1) {
          console.error('Could not find contest-files bucket in URL');
          // URL 형식이 예상과 다르면 DB에서만 삭제
          console.log('Proceeding with database deletion only');
        } else {
          // contest-files 이후의 모든 경로를 파일 경로로 사용
          const filePath = urlParts.slice(bucketIndex + 1).join('/');
          console.log('Storage file path:', filePath);
          
          const { error: storageError } = await supabase.storage
            .from('contest-files')
            .remove([filePath]);

          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Storage 삭제 실패 시에도 DB 삭제는 진행
            console.log('Storage deletion failed, but proceeding with database deletion');
          } else {
            console.log('File deleted from storage successfully');
            storageDeleted = true;
          }
        }
      } catch (storageError) {
        console.error('Error in storage deletion:', storageError);
        // Storage 삭제 중 오류가 발생해도 DB 삭제는 진행
        console.log('Storage deletion error, but proceeding with database deletion');
      }

      // DB에서 파일 정보 삭제
      const { error: deleteError } = await supabase
        .from('contest_files')
        .delete()
        .eq('id', fileId);

      if (deleteError) {
        console.error('Error deleting file from database:', deleteError);
        return false;
      }

      console.log('File deleted from database successfully');
      
      // Storage 삭제가 실패했지만 DB 삭제는 성공한 경우
      if (!storageDeleted) {
        console.warn('File was deleted from database but not from storage. This may need manual cleanup.');
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
        // 인증된 사용자가 없으면 false 반환
        return false;
      }

      // 파일 정보 조회
      const { data: fileData, error: fetchError } = await supabase
        .from('contest_files')
        .select('contest_id, user_id')
        .eq('id', fileId)
        .single();

      if (fetchError || !fileData) {
        console.error('Error fetching file:', fetchError);
        return false;
      }

      // 공모전 작성자 확인
      const { data: contestData, error: contestError } = await supabase
        .from('contests')
        .select('user_id')
        .eq('id', fileData.contest_id)
        .single();

      if (contestError || !contestData) {
        console.error('Error fetching contest:', contestError);
        return false;
      }

      const isContestOwner = contestData.user_id === userId;
      const isFileOwner = fileData.user_id === userId;

      // 권한 확인: 작성자이거나 파일 업로더만 편집 가능
      if (!isContestOwner && !isFileOwner) {
        console.error('User does not have permission to edit this file');
        return false;
      }

      // DB에서 파일 프롬프트 업데이트
      const { error } = await supabase
        .from('contest_files')
        .update({ prompt })
        .eq('id', fileId);

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

  // 삭제된 파일 정리 (관리자용)
  static async cleanupDeletedFiles(contestId: string): Promise<number> {
    try {
      console.log(`Starting cleanup for contest: ${contestId}`);
      
      // 해당 공모전의 모든 파일 조회
      const { data: files, error: fetchError } = await supabase
        .from('contest_files')
        .select('*')
        .eq('contest_id', contestId);

      if (fetchError) {
        console.error('Error fetching files for cleanup:', fetchError);
        return 0;
      }

      if (!files || files.length === 0) {
        console.log('No files found for cleanup');
        return 0;
      }

      let deletedCount = 0;

      for (const file of files) {
        try {
          // Storage에서 파일 존재 여부 확인
          const urlParts = file.url.split('/');
          const bucketIndex = urlParts.findIndex(part => part === 'contest-files');
          
          if (bucketIndex === -1) {
            console.log(`Invalid URL format for file ${file.id}: ${file.url}`);
            continue;
          }
          
          const filePath = urlParts.slice(bucketIndex + 1).join('/');
          
          // Storage에서 파일 존재 여부 확인
          const { data: storageData, error: storageError } = await supabase.storage
            .from('contest-files')
            .list(filePath.split('/').slice(0, -1).join('/'));

          if (storageError) {
            console.log(`Storage error for file ${file.id}:`, storageError);
            // Storage 접근 오류 시 DB에서 삭제
            const { error: deleteError } = await supabase
              .from('contest_files')
              .delete()
              .eq('id', file.id);
            
            if (!deleteError) {
              deletedCount++;
              console.log(`Deleted orphaned file record: ${file.id}`);
            }
            continue;
          }

          // 파일이 Storage에 존재하지 않으면 DB에서도 삭제
          const fileName = filePath.split('/').pop();
          const fileExists = storageData?.some(item => item.name === fileName);
          
          if (!fileExists) {
            const { error: deleteError } = await supabase
              .from('contest_files')
              .delete()
              .eq('id', file.id);
            
            if (!deleteError) {
              deletedCount++;
              console.log(`Deleted orphaned file record: ${file.id} (${file.name})`);
            }
          }
        } catch (error) {
          console.error(`Error processing file ${file.id}:`, error);
        }
      }

      console.log(`Cleanup completed. Deleted ${deletedCount} orphaned files.`);
      return deletedCount;
    } catch (error) {
      console.error('Error in cleanupDeletedFiles:', error);
      return 0;
    }
  }
} 