import { File, FileText, Image, Video, Music, FileAudio } from 'lucide-react';

// 파일 확장자 상수
const FILE_EXTENSIONS = {
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico', '.tiff', '.tga'],
  VIDEO: ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.m4v', '.3gp'],
  AUDIO: ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma', '.opus'],
  DOCUMENT: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.pages'],
  SPREADSHEET: ['.xls', '.xlsx', '.csv', '.ods', '.numbers'],
  PRESENTATION: ['.ppt', '.pptx', '.key', '.odp'],
  ARCHIVE: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  CODE: ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json', '.xml', '.py', '.java', '.cpp', '.c', '.php'],
} as const;

// 비디오 썸네일 추출 관련 상수
const THUMBNAIL_QUALITY = 0.9; // 품질 향상
const THUMBNAIL_WIDTH = 320; // 해상도 향상
const THUMBNAIL_HEIGHT = 180; // 16:9 비율
const THUMBNAIL_TIME_OFFSETS = [0.5, 1, 2, 5]; // 여러 시간 지점 시도

// 이미지 파일인지 확인하는 함수
export const isImageFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return FILE_EXTENSIONS.IMAGE.includes(extension as any);
};

// 비디오 파일인지 확인하는 함수
export const isVideoFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return FILE_EXTENSIONS.VIDEO.includes(extension as any);
};

// 오디오 파일인지 확인하는 함수
export const isAudioFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return FILE_EXTENSIONS.AUDIO.includes(extension as any);
};

// 문서 파일인지 확인하는 함수
export const isDocumentFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return FILE_EXTENSIONS.DOCUMENT.includes(extension as any);
};

// 스프레드시트 파일인지 확인하는 함수
export const isSpreadsheetFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return FILE_EXTENSIONS.SPREADSHEET.includes(extension as any);
};

// 프레젠테이션 파일인지 확인하는 함수
export const isPresentationFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return FILE_EXTENSIONS.PRESENTATION.includes(extension as any);
};

// 압축 파일인지 확인하는 함수
export const isArchiveFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return FILE_EXTENSIONS.ARCHIVE.includes(extension as any);
};

// 코드 파일인지 확인하는 함수
export const isCodeFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return FILE_EXTENSIONS.CODE.includes(extension as any);
};

// 파일 타입 분류 함수
export const getFileType = (fileName: string): string => {
  if (isImageFile(fileName)) return 'image';
  if (isVideoFile(fileName)) return 'video';
  if (isAudioFile(fileName)) return 'audio';
  if (isDocumentFile(fileName)) return 'document';
  if (isSpreadsheetFile(fileName)) return 'spreadsheet';
  if (isPresentationFile(fileName)) return 'presentation';
  if (isArchiveFile(fileName)) return 'archive';
  if (isCodeFile(fileName)) return 'code';
  return 'other';
};

// 파일 아이콘 가져오기 함수
export const getFileIcon = (fileName: string) => {
  const fileType = getFileType(fileName);
  
  switch (fileType) {
    case 'image':
      return Image;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    case 'document':
    case 'spreadsheet':
    case 'presentation':
      return FileText;
    case 'code':
      return File;
    default:
      return File;
  }
};

// 파일 타입별 색상 가져오기 함수
export const getFileTypeColor = (fileName: string): string => {
  const fileType = getFileType(fileName);
  
  switch (fileType) {
    case 'image':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'video':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'audio':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'document':
    case 'spreadsheet':
    case 'presentation':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'archive':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'code':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// 비디오 썸네일 추출 함수 (개선된 버전)
export const extractVideoThumbnail = async (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 비디오 URL 생성
      const videoUrl = URL.createObjectURL(videoFile);
      
      // 비디오 엘리먼트 생성
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      
      // Canvas 엘리먼트 생성
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Canvas 크기 설정
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = THUMBNAIL_HEIGHT;
      
      let currentTimeIndex = 0;
      
      // 비디오 로드 이벤트
      video.onloadedmetadata = () => {
        // 첫 번째 시간 지점으로 이동
        const timeOffset = THUMBNAIL_TIME_OFFSETS[currentTimeIndex];
        video.currentTime = Math.min(timeOffset, video.duration);
      };
      
      // 비디오 시간 업데이트 이벤트 (썸네일 추출)
      video.onseeked = () => {
        try {
          // 비디오 프레임을 Canvas에 그리기
          ctx.drawImage(video, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
          
          // 이미지 데이터 분석하여 밝기 확인
          const imageData = ctx.getImageData(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
          const data = imageData.data;
          let totalBrightness = 0;
          
          // 평균 밝기 계산
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            totalBrightness += (r + g + b) / 3;
          }
          
          const averageBrightness = totalBrightness / (data.length / 4);
          
          // 밝기가 너무 어두우면 다음 시간 지점 시도
          if (averageBrightness < 50 && currentTimeIndex < THUMBNAIL_TIME_OFFSETS.length - 1) {
            currentTimeIndex++;
            const nextTimeOffset = THUMBNAIL_TIME_OFFSETS[currentTimeIndex];
            video.currentTime = Math.min(nextTimeOffset, video.duration);
            return;
          }
          
          // 밝기 및 대비 조정
          ctx.putImageData(imageData, 0, 0);
          
          // 밝기 조정
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
          
          // Canvas를 데이터 URL로 변환
          const thumbnailUrl = canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);
          
          // 리소스 정리
          URL.revokeObjectURL(videoUrl);
          video.remove();
          canvas.remove();
          
          resolve(thumbnailUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      // 에러 처리
      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        video.remove();
        canvas.remove();
        reject(new Error('Failed to load video'));
      };
      
      // 비디오 로드 시작
      video.src = videoUrl;
      video.load();
      
    } catch (error) {
      reject(error);
    }
  });
};

// 비디오 URL에서 썸네일 추출 함수 (개선된 버전)
export const extractVideoThumbnailFromUrl = async (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 비디오 엘리먼트 생성
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      
      // Canvas 엘리먼트 생성
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Canvas 크기 설정
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = THUMBNAIL_HEIGHT;
      
      let currentTimeIndex = 0;
      
      // 비디오 로드 이벤트
      video.onloadedmetadata = () => {
        // 첫 번째 시간 지점으로 이동
        const timeOffset = THUMBNAIL_TIME_OFFSETS[currentTimeIndex];
        video.currentTime = Math.min(timeOffset, video.duration);
      };
      
      // 비디오 시간 업데이트 이벤트 (썸네일 추출)
      video.onseeked = () => {
        try {
          // 비디오 프레임을 Canvas에 그리기
          ctx.drawImage(video, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
          
          // 이미지 데이터 분석하여 밝기 확인
          const imageData = ctx.getImageData(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
          const data = imageData.data;
          let totalBrightness = 0;
          
          // 평균 밝기 계산
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            totalBrightness += (r + g + b) / 3;
          }
          
          const averageBrightness = totalBrightness / (data.length / 4);
          
          // 밝기가 너무 어두우면 다음 시간 지점 시도
          if (averageBrightness < 50 && currentTimeIndex < THUMBNAIL_TIME_OFFSETS.length - 1) {
            currentTimeIndex++;
            const nextTimeOffset = THUMBNAIL_TIME_OFFSETS[currentTimeIndex];
            video.currentTime = Math.min(nextTimeOffset, video.duration);
            return;
          }
          
          // 밝기 및 대비 조정
          ctx.putImageData(imageData, 0, 0);
          
          // 밝기 조정
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
          
          // Canvas를 데이터 URL로 변환
          const thumbnailUrl = canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);
          
          // 리소스 정리
          video.remove();
          canvas.remove();
          
          resolve(thumbnailUrl);
        } catch (error) {
          reject(error);
        }
      };
      
      // 에러 처리
      video.onerror = () => {
        video.remove();
        canvas.remove();
        reject(new Error('Failed to load video'));
      };
      
      // 비디오 로드 시작
      video.src = videoUrl;
      video.load();
      
    } catch (error) {
      reject(error);
    }
  });
};

// 파일 크기 포맷팅 함수
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 파일명에서 확장자 제거
export const removeFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
};

// 파일 확장자 가져오기
export const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : '';
};

// 안전한 파일명 생성 (특수문자 제거)
export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
};

// 파일 업로드 가능 여부 확인
export const isFileUploadable = (file: File, maxSize: number = 100 * 1024 * 1024): boolean => {
  // 파일 크기 확인
  if (file.size > maxSize) {
    return false;
  }
  
  // 파일 타입 확인 (선택적)
  const allowedTypes = [
    ...FILE_EXTENSIONS.IMAGE,
    ...FILE_EXTENSIONS.VIDEO,
    ...FILE_EXTENSIONS.AUDIO,
    ...FILE_EXTENSIONS.DOCUMENT,
    ...FILE_EXTENSIONS.SPREADSHEET,
    ...FILE_EXTENSIONS.PRESENTATION,
    ...FILE_EXTENSIONS.ARCHIVE,
    ...FILE_EXTENSIONS.CODE,
  ];
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension as any);
}; 