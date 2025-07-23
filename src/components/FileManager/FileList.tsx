import React, { memo, useMemo, useCallback } from 'react';
import { Search, Filter, SortAsc, SortDesc, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileItem as FileItemType } from '@/services/fileService';
import { isImageFile, isVideoFile } from './utils/fileUtils';
import FileItem from './FileItem';
import FileGridItem from './FileGridItem';

interface FileListProps {
  files: FileItemType[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fileTypeFilter: string;
  setFileTypeFilter: (filter: string) => void;
  sortBy: 'name' | 'date' | 'size' | 'type';
  setSortBy: (sort: 'name' | 'date' | 'size' | 'type') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  onView: (file: FileItemType) => void;
  onDownload: (file: FileItemType) => void;
  onDelete: (fileId: number) => void;
  onEdit?: (file: FileItemType) => void;
  getFileTypeColor: (type: string) => string;
}

const FileList = memo(({
  files,
  loading,
  searchTerm,
  setSearchTerm,
  fileTypeFilter,
  setFileTypeFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
  onView,
  onDownload,
  onDelete,
  onEdit,
  getFileTypeColor
}: FileListProps) => {
  // 검색 핸들러 메모이제이션
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  // 파일 타입 필터 핸들러 메모이제이션
  const handleFileTypeFilterChange = useCallback((value: string) => {
    setFileTypeFilter(value);
  }, [setFileTypeFilter]);

  // 정렬 핸들러들 메모이제이션
  const handleSortByChange = useCallback((value: string) => {
    setSortBy(value as 'name' | 'date' | 'size' | 'type');
  }, [setSortBy]);

  const handleSortOrderChange = useCallback((value: string) => {
    setSortOrder(value as 'asc' | 'desc');
  }, [setSortOrder]);

  // 뷰 모드 핸들러 메모이제이션
  const handleViewModeChange = useCallback((mode: 'list' | 'grid') => {
    setViewMode(mode);
  }, [setViewMode]);

  // 필터링된 파일 목록
  const filteredFiles = useMemo(() => {
    let filtered = files;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 파일 타입 필터
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(file => file.type === fileTypeFilter);
    }

    // 그리드 모드일 때는 이미지, 비디오 파일만 표시
    if (viewMode === 'grid') {
      filtered = filtered.filter(file => isImageFile(file.name) || isVideoFile(file.name));
    }

    return filtered;
  }, [files, searchTerm, fileTypeFilter, viewMode]);

  // 정렬된 파일 목록
  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          const dateA = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
          const dateB = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredFiles, sortBy, sortOrder]);

  // 파일 타입 옵션들
  const fileTypeOptions = useMemo(() => [
    { value: 'all', label: '전체' },
    { value: 'image', label: '이미지' },
    { value: 'video', label: '비디오' },
    { value: 'audio', label: '오디오' },
    { value: 'document', label: '문서' },
  ], []);

  // 정렬 옵션들
  const sortOptions = useMemo(() => [
    { value: 'date', label: '업로드 날짜' },
    { value: 'name', label: '파일명' },
    { value: 'size', label: '파일 크기' },
    { value: 'type', label: '파일 타입' },
  ], []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="파일 검색..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-64"
                disabled
              />
            </div>
            <Select disabled>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="타입" />
              </SelectTrigger>
            </Select>
            <Select disabled>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <SortAsc className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <SortDesc className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 및 정렬 컨트롤 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="파일 검색..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-64"
            />
          </div>
          <Select value={fileTypeFilter} onValueChange={handleFileTypeFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="타입" />
            </SelectTrigger>
            <SelectContent>
              {fileTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={sortOrder === 'asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortOrderChange('asc')}
          >
            <SortAsc className="h-4 w-4" />
          </Button>
          <Button
            variant={sortOrder === 'desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortOrderChange('desc')}
          >
            <SortDesc className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 뷰 모드 토글 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {sortedFiles.length}개 파일
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
            className="h-8 px-3"
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-3 h-0.5 bg-current"></div>
              <div className="w-3 h-0.5 bg-current"></div>
              <div className="w-3 h-0.5 bg-current"></div>
            </div>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
            className="h-8 px-3"
          >
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-current"></div>
              <div className="w-1.5 h-1.5 bg-current"></div>
              <div className="w-1.5 h-1.5 bg-current"></div>
              <div className="w-1.5 h-1.5 bg-current"></div>
            </div>
          </Button>
        </div>
      </div>

      {/* 파일 목록 */}
      {sortedFiles.length === 0 ? (
        <div className="text-center py-8">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || fileTypeFilter !== 'all' 
              ? '검색 결과가 없습니다.' 
              : '업로드된 파일이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
          : 'space-y-2'
        }>
          {sortedFiles.map(file => (
            viewMode === 'grid' ? (
              <FileGridItem
                key={file.id}
                file={file}
                onView={onView}
                onDownload={onDownload}
                onDelete={onDelete}
                onEdit={onEdit}
                getFileTypeColor={getFileTypeColor}
              />
            ) : (
              <FileItem
                key={file.id}
                file={file}
                onView={onView}
                onDownload={onDownload}
                onDelete={onDelete}
                onEdit={onEdit}
                getFileTypeColor={getFileTypeColor}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
});

FileList.displayName = 'FileList';

export default FileList; 