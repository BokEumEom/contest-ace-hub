import React, { memo, useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, FileText, Plus, Trash2, Link, Unlink, GripVertical, Search, Filter, SortAsc, SortDesc, Eye, Copy, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ContestSubmission } from '@/types/contest';
import { ContestSubmissionService } from '@/services/contestSubmissionService';
import { useToast } from '@/hooks/use-toast';

interface DescriptionEditorProps {
  contestId: string;
  files: any[]; // FileItem 타입을 사용해야 하지만 임시로 any 사용
}

type SortOption = 'title' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type FilterOption = 'all' | 'withFiles' | 'withoutFiles';

const DescriptionEditor = memo(({ contestId, files }: DescriptionEditorProps) => {
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContestSubmission | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ContestSubmission>>({});
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [newSubmissionFileIds, setNewSubmissionFileIds] = useState<number[]>([]);
  
  // 검색 및 필터링 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const { toast } = useToast();

  // 작품 설명 목록 로드
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const submissionsList = await ContestSubmissionService.getSubmissions(contestId);
      setSubmissions(submissionsList);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "오류",
        description: "작품 설명을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 및 정렬된 설명 목록
  const filteredAndSortedSubmissions = useCallback(() => {
    let filtered = submissions;

    // 검색 필터링
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 파일 연결 상태 필터링
    if (filterBy === 'withFiles') {
      filtered = filtered.filter(submission => submission.fileIds.length > 0);
    } else if (filterBy === 'withoutFiles') {
      filtered = filtered.filter(submission => submission.fileIds.length === 0);
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [submissions, searchTerm, filterBy, sortBy, sortOrder]);

  // 작품 설명 보기
  const handleViewSubmission = (submission: ContestSubmission) => {
    setSelectedSubmission(submission);
    setViewModalOpen(true);
  };

  // 작품 설명 편집
  const handleEditSubmission = (submission: ContestSubmission) => {
    setSelectedSubmission(submission);
    setEditForm({
      title: submission.title,
      description: submission.description,
    });
    setEditModalOpen(true);
  };

  // 새 작품 설명 생성 모달 열기
  const handleCreateSubmissionModal = () => {
    setSelectedSubmission(null);
    setEditForm({});
    setNewSubmissionFileIds([]);
    setEditModalOpen(true);
  };

  // 파일 연결 모달 열기
  const handleOpenLinkModal = (submission: ContestSubmission) => {
    setSelectedSubmission(submission);
    setSelectedFileIds([...submission.fileIds]);
    setLinkModalOpen(true);
  };

  // 파일 선택 토글 (기존 연결용)
  const toggleFileSelection = (fileId: number) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 파일 선택 토글 (새 설명 등록용)
  const toggleNewSubmissionFileSelection = (fileId: number) => {
    setNewSubmissionFileIds(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 파일 연결 저장
  const handleSaveFileConnections = async () => {
    if (!selectedSubmission) return;

    try {
      const updatedSubmission = await ContestSubmissionService.updateSubmission(selectedSubmission.id, {
        fileIds: selectedFileIds,
      });
      
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id ? updatedSubmission : sub
      ));
      setLinkModalOpen(false);
      setSelectedSubmission(null);
      setSelectedFileIds([]);
      
      toast({
        title: "성공",
        description: "파일 연결이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Error updating file connections:', error);
      toast({
        title: "오류",
        description: "파일 연결 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 설명 추가
  const handleAdd = async () => {
    if (!editForm.title?.trim() || !editForm.description?.trim()) {
      toast({
        title: "오류",
        description: "제목과 설명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newSubmission = await ContestSubmissionService.createSubmission({
        contestId,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        fileIds: newSubmissionFileIds,
      });
      
      setSubmissions(prev => [newSubmission, ...prev]);
      setEditModalOpen(false);
      setSelectedSubmission(null);
      setEditForm({});
      setNewSubmissionFileIds([]);
      
      toast({
        title: "성공",
        description: "작품 설명이 추가되었습니다.",
      });
    } catch (error) {
      console.error('Error adding submission:', error);
      toast({
        title: "오류",
        description: "작품 설명 추가에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 설명 업데이트
  const handleUpdateSubmission = async () => {
    if (!selectedSubmission?.id || !editForm.title?.trim() || !editForm.description?.trim()) {
      toast({
        title: "오류",
        description: "제목과 설명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const updatedSubmission = await ContestSubmissionService.updateSubmission(selectedSubmission.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
      });
      
      setSubmissions(prev => prev.map(sub => 
        sub.id === selectedSubmission.id ? updatedSubmission : sub
      ));
      setEditModalOpen(false);
      setSelectedSubmission(null);
      setEditForm({});
      
      toast({
        title: "성공",
        description: "작품 설명이 수정되었습니다.",
      });
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "오류",
        description: "작품 설명 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 설명 삭제
  const handleDelete = async (id: string) => {
    // 삭제 권한 확인
    const submission = submissions.find(s => s.id === id);
    if (!submission || !submission.canDelete) {
      toast({
        title: "권한 없음",
        description: "이 작품 설명을 삭제할 권한이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (confirm('이 작품 설명을 삭제하시겠습니까?')) {
      try {
        await ContestSubmissionService.deleteSubmission(id);
        setSubmissions(prev => prev.filter(sub => sub.id !== id));
        
        toast({
          title: "성공",
          description: "작품 설명이 삭제되었습니다.",
        });
      } catch (error) {
        console.error('Error deleting submission:', error);
        toast({
          title: "오류",
          description: "작품 설명 삭제에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 설명 복사
  const handleCopySubmission = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: "작품 설명이 클립보드에 복사되었습니다.",
    });
  };

  // 초기화
  useEffect(() => {
    loadSubmissions();
  }, [contestId]);

  const filteredSubmissions = filteredAndSortedSubmissions();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-contest-orange" />
              작품 설명 ({filteredSubmissions.length}개)
            </div>
            <Button
              onClick={handleCreateSubmissionModal}
              size="sm"
              className="bg-contest-orange hover:bg-contest-orange/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              작품 설명 등록
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-contest-orange mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">작품 설명 목록을 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => {
                  return (
                    <div key={submission.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded bg-blue-100 text-blue-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {submission.title}
                            </p>
                            {submission.fileIds.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {submission.fileIds.length}개 파일
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                            {submission.description.length > 100 
                              ? `${submission.description.substring(0, 100)}...` 
                              : submission.description
                            }
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{submission.createdAt ? new Date(submission.createdAt).toLocaleDateString('ko-KR') : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                          title="작품 설명 보기"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {/* 편집 권한이 있는 경우에만 편집 버튼 표시 */}
                        {submission.canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSubmission(submission)}
                            title="작품 설명 편집"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {/* 삭제 권한이 있는 경우에만 삭제 버튼 표시 */}
                        {submission.canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(submission.id)}
                            title="작품 설명 삭제"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">저장된 작품 설명이 없습니다.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    "작품 설명 등록" 버튼을 클릭하여 작품에 대한 설명을 등록해보세요.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 작품 설명 보기 모달 */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-contest-orange" />
              작품 설명 상세 보기
            </DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">제목</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.title}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">연결된 파일</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.fileIds.length}개
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">설명</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap break-words">{selectedSubmission.description}</p>
                </div>
              </div>
              {selectedSubmission.fileIds.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">연결된 파일 목록</Label>
                  <div className="mt-2 space-y-2">
                    {Array.from(new Set(selectedSubmission.fileIds)).map(fileId => {
                      const file = files.find(f => f.id === fileId);
                      return file ? (
                        <div key={fileId} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">생성일</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleDateString('ko-KR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">수정일</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.updatedAt ? new Date(selectedSubmission.updatedAt).toLocaleDateString('ko-KR') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 작품 설명 편집 모달 */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSubmission ? (
                <>
                  <Edit className="h-5 w-5 text-contest-orange" />
                  작품 설명 편집
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-contest-orange" />
                  작품 설명 등록
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div>
              <Label htmlFor="submission-title">제목</Label>
              <Input
                id="submission-title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="작품 설명 제목을 입력하세요"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="submission-description">설명</Label>
              <Textarea
                id="submission-description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[120px] max-h-60 mt-2 resize-none"
                placeholder="작품에 대한 설명을 입력하세요..."
              />
            </div>
            {!selectedSubmission && files.length > 0 && (
              <div>
                <Label className="text-sm font-medium">연결할 파일 선택 (선택사항)</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`new-file-${file.id}`}
                        checked={newSubmissionFileIds.includes(file.id)}
                        onCheckedChange={() => toggleNewSubmissionFileSelection(file.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {file.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          크기: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {newSubmissionFileIds.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {newSubmissionFileIds.length}개 파일이 선택되었습니다.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={selectedSubmission ? handleUpdateSubmission : handleAdd}
              className="bg-contest-orange hover:bg-contest-orange/90"
            >
              {selectedSubmission ? '업데이트' : '등록'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 파일 연결 모달 */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-contest-orange" />
              파일 연결 관리
              {selectedSubmission && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {selectedSubmission.title}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {files.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium">연결할 파일 선택</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`file-${file.id}`}
                        checked={selectedFileIds.includes(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {file.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          크기: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedFileIds.length}개 파일이 선택되었습니다.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">연결할 파일이 없습니다.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  파일 관리 탭에서 파일을 업로드한 후 다시 시도해주세요.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setLinkModalOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleSaveFileConnections}
              className="bg-contest-orange hover:bg-contest-orange/90"
              disabled={files.length === 0}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

DescriptionEditor.displayName = 'DescriptionEditor';

export default DescriptionEditor; 