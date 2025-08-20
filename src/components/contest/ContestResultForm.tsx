import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, Plus, AlertCircle, File, X, Link, Search, Filter, Trash2, CheckSquare, Square } from 'lucide-react';
import { ContestResultFormData } from '@/types/contest';
import { FileService, FileItem } from '@/services/fileService';

interface ContestResultFormProps {
  contestId: number;
  onSubmit: (result: ContestResultFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ContestResultForm: React.FC<ContestResultFormProps> = ({
  contestId,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ContestResultFormData>({
    description: '',
    status: '',
    prize_amount: '',
    feedback: '',
    announcement_date: new Date().toISOString().split('T')[0],
    file_ids: []
  });

  const [errors, setErrors] = useState<Partial<ContestResultFormData>>({});
  const [availableFiles, setAvailableFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  // 파일 검색 및 필터링 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // 사용 가능한 파일 목록 로드
  useEffect(() => {
    const loadFiles = async () => {
      setLoadingFiles(true);
      try {
        const files = await FileService.getFiles(contestId.toString());
        setAvailableFiles(files);
      } catch (error) {
        console.error('Error loading files:', error);
      } finally {
        setLoadingFiles(false);
      }
    };

    loadFiles();
  }, [contestId]);

  // 파일 선택/해제 처리
  const handleFileToggle = (fileId: number) => {
    const fileIdStr = fileId.toString();
    setSelectedFileIds(prev => {
      if (prev.includes(fileIdStr)) {
        return prev.filter(id => id !== fileIdStr);
      } else {
        return [...prev, fileIdStr];
      }
    });
  };

  // 선택된 파일 ID를 formData에 반영
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      file_ids: selectedFileIds
    }));
  }, [selectedFileIds]);

  // 파일 필터링 및 검색
  const filteredFiles = availableFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = fileTypeFilter === 'all' || file.type === fileTypeFilter;
    const matchesSelection = !showSelectedOnly || selectedFileIds.includes(file.id.toString());
    
    return matchesSearch && matchesType && matchesSelection;
  });

  // 일괄 선택/해제
  const handleSelectAll = () => {
    if (selectedFileIds.length === filteredFiles.length) {
      // 모든 파일 선택 해제
      setSelectedFileIds([]);
    } else {
      // 모든 파일 선택
      const allFileIds = filteredFiles.map(file => file.id.toString());
      setSelectedFileIds(allFileIds);
    }
  };

  // 선택된 파일 연결 해제
  const handleRemoveFile = (fileId: string) => {
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
  };

  // 선택된 파일 일괄 제거
  const handleRemoveAllFiles = () => {
    setSelectedFileIds([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContestResultFormData> = {};

    if (!formData.status.trim()) {
      newErrors.status = '결과 상태를 입력해주세요';
    }

    if (!formData.announcement_date) {
      newErrors.announcement_date = '발표일을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // 폼 초기화
      setFormData({
        description: '',
        status: '',
        prize_amount: '',
        feedback: '',
        announcement_date: new Date().toISOString().split('T')[0],
        file_ids: []
      });
      setErrors({});
      setSelectedFileIds([]);
      setSearchTerm('');
      setFileTypeFilter('all');
      setShowSelectedOnly(false);
    } catch (error) {
      console.error('Error submitting result:', error);
    }
  };

  const handleInputChange = (field: keyof ContestResultFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="h-6 w-6 text-yellow-600" />
          공모전 결과 추가
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          공모전 결과를 입력하여 참가자들에게 피드백을 제공하세요
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 결과 상태 */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              결과 상태 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              placeholder="예: 1등상, 특별상, 최종선정, 우수상 등"
              className={errors.status ? 'border-red-500' : ''}
            />
            {errors.status && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.status}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              공모전의 수상 명칭이나 결과 상태를 자유롭게 입력하세요
            </p>
          </div>

          {/* 상금 */}
          <div className="space-y-2">
            <Label htmlFor="prize_amount" className="text-sm font-medium">
              상금
            </Label>
            <Input
              id="prize_amount"
              value={formData.prize_amount}
              onChange={(e) => handleInputChange('prize_amount', e.target.value)}
              placeholder="예: 100만원 또는 특별상"
            />
          </div>

          {/* 발표일 */}
          <div className="space-y-2">
            <Label htmlFor="announcement_date" className="text-sm font-medium">
              발표일 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="announcement_date"
              type="date"
              value={formData.announcement_date}
              onChange={(e) => handleInputChange('announcement_date', e.target.value)}
              className={errors.announcement_date ? 'border-red-500' : ''}
            />
            {errors.announcement_date && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.announcement_date}
              </p>
            )}
          </div>

          {/* 파일 연결 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4" />
              관련 파일 연결
            </Label>
            <div className="text-sm text-muted-foreground mb-3">
              이 결과와 관련된 파일들을 선택하세요. 체크박스를 클릭하여 선택/해제할 수 있습니다.
            </div>
            
            {loadingFiles ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                파일을 불러오는 중...
              </div>
            ) : availableFiles.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-gray-50">
                📁 이 공모전에 업로드된 파일이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {/* 검색 및 필터링 */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="파일명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Input
                    placeholder="파일 타입 (예: image, video)"
                    value={fileTypeFilter === 'all' ? '' : fileTypeFilter}
                    onChange={(e) => setFileTypeFilter(e.target.value || 'all')}
                    className="w-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                    className={showSelectedOnly ? 'bg-blue-50 border-blue-300' : ''}
                  >
                    {showSelectedOnly ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
                    선택된 것만
                  </Button>
                </div>

                {/* 일괄 선택/해제 */}
                {filteredFiles.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedFileIds.length === filteredFiles.length && filteredFiles.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-sm font-medium">
                        {selectedFileIds.length === filteredFiles.length ? '모두 선택 해제' : '모두 선택'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedFileIds.length} / {filteredFiles.length} 선택됨
                    </span>
                  </div>
                )}

                {/* 파일 목록 */}
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {filteredFiles.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {searchTerm || fileTypeFilter !== 'all' ? '검색 결과가 없습니다.' : '파일이 없습니다.'}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredFiles.map(file => (
                        <div
                          key={file.id}
                          className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                            selectedFileIds.includes(file.id.toString()) ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                          }`}
                        >
                          <Checkbox
                            checked={selectedFileIds.includes(file.id.toString())}
                            onCheckedChange={() => handleFileToggle(file.id)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              <span className="font-medium truncate">{file.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {file.type}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {FileService.formatFileSize(file.size)} • {file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 선택된 파일 요약 */}
                {selectedFileIds.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        ✅ {selectedFileIds.length}개 파일이 선택되었습니다
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAllFiles}
                        className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        모두 해제
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedFileIds.map(fileId => {
                        const file = availableFiles.find(f => f.id.toString() === fileId);
                        return file ? (
                          <Badge
                            key={fileId}
                            variant="default"
                            className="text-xs bg-blue-600 hover:bg-blue-700"
                          >
                            {file.name}
                            <button
                              onClick={() => handleRemoveFile(fileId)}
                              className="ml-1 hover:bg-blue-800 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 프로젝트 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              프로젝트 설명
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
              rows={3}
            />
          </div>

          {/* 심사 피드백 */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              심사 피드백
            </Label>
            <Textarea
              id="feedback"
              value={formData.feedback}
              onChange={(e) => handleInputChange('feedback', e.target.value)}
              placeholder="심사위원의 피드백이나 평가 의견을 입력하세요"
              rows={4}
            />
          </div>

          {/* 버튼 그룹 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  저장 중...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  결과 추가
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
