import React, { memo, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileItem as FileItemType } from '@/services/fileService';
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
  getFileTypeColor
}: FileListProps) => {
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

    // 그리드 모드일 때는 이미지 파일만 표시
    if (viewMode === 'grid') {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      filtered = filtered.filter(file => {
        const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        return imageExtensions.includes(extension);
      });
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

  // 파일 타입별 통계
  const fileStats = useMemo(() => {
    const stats = {
      total: files.length,
      images: files.filter(f => f.type === 'image').length,
      documents: files.filter(f => f.type === 'document').length,
      videos: files.filter(f => f.type === 'video').length,
      audio: files.filter(f => f.type === 'audio').length,
      other: files.filter(f => !['image', 'document', 'video', 'audio'].includes(f.type)).length
    };
    return stats;
  }, [files]);

  return (
    <div className="space-y-4">
      {/* 파일 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{fileStats.total}</div>
          <div className="text-xs text-muted-foreground">전체</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{fileStats.images}</div>
          <div className="text-xs text-muted-foreground">이미지</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{fileStats.documents}</div>
          <div className="text-xs text-muted-foreground">문서</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{fileStats.videos}</div>
          <div className="text-xs text-muted-foreground">비디오</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">{fileStats.audio}</div>
          <div className="text-xs text-muted-foreground">오디오</div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="파일명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="image">이미지</SelectItem>
              <SelectItem value="document">문서</SelectItem>
              <SelectItem value="video">비디오</SelectItem>
              <SelectItem value="audio">오디오</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">날짜순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="size">크기순</SelectItem>
              <SelectItem value="type">타입순</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* 뷰 모드 토글 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">파일 목록</h3>
          {filteredFiles.length !== files.length && (
            <Badge variant="secondary" className="text-xs">
              {filteredFiles.length} / {files.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
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
            onClick={() => setViewMode('grid')}
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

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-contest-orange mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">파일 목록을 불러오는 중...</p>
        </div>
      ) : sortedFiles.length > 0 ? (
        viewMode === 'list' ? (
          // 리스트 뷰
          <div className="space-y-2">
            {sortedFiles.map(file => (
              <FileItem
                key={file.id}
                file={file}
                onView={onView}
                onDownload={onDownload}
                onDelete={onDelete}
                getFileTypeColor={getFileTypeColor}
              />
            ))}
          </div>
        ) : (
          // 그리드 뷰
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedFiles.map(file => (
              <FileGridItem
                key={file.id}
                file={file}
                onView={onView}
                onDownload={onDownload}
                onDelete={onDelete}
                getFileTypeColor={getFileTypeColor}
                gridMode={true}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-8">
          {files.length === 0 ? (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">업로드된 파일이 없습니다.</p>
              <p className="text-xs text-muted-foreground mt-1">
                파일을 업로드하고 사용된 프롬프트를 함께 관리해보세요.
              </p>
            </>
          ) : viewMode === 'grid' && !filteredFiles.some(file => {
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
            const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            return imageExtensions.includes(extension);
          }) ? (
            <>
              <div className="h-12 w-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">이미지 파일이 없습니다.</p>
              <p className="text-xs text-muted-foreground mt-1">
                그리드 모드에서는 이미지 파일만 표시됩니다. 리스트 모드에서 다른 파일을 확인하세요.
              </p>
            </>
          ) : (
            <>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
              <p className="text-xs text-muted-foreground mt-1">
                검색어나 필터를 변경해보세요.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
});

FileList.displayName = 'FileList';

export default FileList; 