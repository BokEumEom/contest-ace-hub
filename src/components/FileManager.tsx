import React, { useState } from 'react';
import { Upload, File, Download, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

interface FileManagerProps {
  contestId: string;
}

const FileManager: React.FC<FileManagerProps> = ({ contestId }) => {
  const [files, setFiles] = useState<FileItem[]>([]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-700';
      case 'image':
        return 'bg-green-100 text-green-700';
      case 'video':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach(file => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        size: file.size,
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      
      setFiles(prev => [...prev, newFile]);
    });
    
    // 파일 input 초기화
    event.target.value = '';
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>파일 관리</span>
          <span className="text-sm font-normal text-muted-foreground">
            {files.length}개 파일
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 파일 업로드 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-contest-orange transition-colors">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            파일을 드래그하거나 클릭하여 업로드하세요
          </p>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>파일 선택</span>
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
            />
          </label>
        </div>

        {/* 파일 목록 */}
        <div className="space-y-2">
          {files.length > 0 ? (
            files.map(file => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded ${getFileTypeColor(file.type)}`}>
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploadedAt}</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteFile(file.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-6">
              업로드된 파일이 없습니다
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManager;
