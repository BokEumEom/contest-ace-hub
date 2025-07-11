import { supabase } from '@/lib/supabase';

export interface ProfileImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class ProfileImageService {
  // 프로필 이미지 업로드
  static async uploadProfileImage(file: File): Promise<ProfileImageUploadResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        return {
          success: false,
          error: '사용자 인증이 필요합니다.'
        };
      }

      // 파일 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: '파일 크기는 5MB 이하여야 합니다.'
        };
      }

      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: '지원되는 이미지 형식: JPEG, PNG, GIF, WEBP'
        };
      }

      // 파일명 정리 및 고유 이름 생성
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
      const filePath = `profiles/${userId}/${fileName}`;

      // 기존 프로필 이미지 삭제 (있는 경우)
      await this.deleteOldProfileImage(userId);

      // Supabase Storage에 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading profile image:', uploadError);
        return {
          success: false,
          error: '이미지 업로드 중 오류가 발생했습니다.'
        };
      }

      // 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      return {
        success: false,
        error: '이미지 업로드 중 오류가 발생했습니다.'
      };
    }
  }

  // 기존 프로필 이미지 삭제
  static async deleteOldProfileImage(userId: string): Promise<void> {
    try {
      // 사용자의 기존 프로필 이미지 목록 조회
      const { data: files, error } = await supabase.storage
        .from('profile-images')
        .list(`profiles/${userId}`);

      if (error) {
        console.error('Error listing old profile images:', error);
        return;
      }

      // 기존 파일들 삭제
      if (files && files.length > 0) {
        const filePaths = files.map(file => `profiles/${userId}/${file.name}`);
        await supabase.storage
          .from('profile-images')
          .remove(filePaths);
      }
    } catch (error) {
      console.error('Error deleting old profile images:', error);
    }
  }

  // 프로필 이미지 삭제
  static async deleteProfileImage(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        return false;
      }

      await this.deleteOldProfileImage(userId);
      return true;
    } catch (error) {
      console.error('Error deleting profile image:', error);
      return false;
    }
  }

  // 이미지 리사이징 (클라이언트 사이드)
  static resizeImage(file: File, maxWidth: number = 400, maxHeight: number = 400): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 비율 유지하면서 리사이징
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기
        ctx?.drawImage(img, 0, 0, width, height);

        // Canvas를 Blob으로 변환
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.8); // 품질 80%
      };

      img.src = URL.createObjectURL(file);
    });
  }
} 