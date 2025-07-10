import { File, FileText } from 'lucide-react';

// 이미지 파일인지 확인하는 함수
export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return imageExtensions.includes(extension);
};

// 파일 아이콘 반환 함수
export const getFileIcon = (type: string): string => {
  switch (type) {
    case 'document':
      return 'document';
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'audio':
      return 'audio';
    default:
      return 'file';
  }
};

// 파일 타입별 색상 반환 함수
export const getFileTypeColor = (type: string): string => {
  switch (type) {
    case 'document':
      return 'bg-blue-100 text-blue-700';
    case 'image':
      return 'bg-green-100 text-green-700';
    case 'video':
      return 'bg-purple-100 text-purple-700';
    case 'audio':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}; 