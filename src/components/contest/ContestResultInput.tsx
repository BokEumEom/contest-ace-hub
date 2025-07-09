import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Award, 
  FileText,
  Plus,
  Trash2,
  Save,
  Edit
} from 'lucide-react';

interface ContestResult {
  id: string;
  teamName: string;
  projectTitle: string;
  description: string;
  status: string;
  rank?: number;
  score?: number;
  prizeAmount?: string;
  feedback?: string;
  announcementDate: string;
}

interface ContestResultInputProps {
  contestId: string;
  onSave: (results: ContestResult[]) => void;
  existingResults?: ContestResult[];
  isLoading?: boolean;
}

const getStatusOptions = () => [
  { value: 'winner', label: '우승', icon: Trophy, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'runner_up', label: '준우승', icon: Medal, color: 'bg-gray-100 text-gray-800' },
  { value: 'shortlisted', label: '최종 후보', icon: Award, color: 'bg-blue-100 text-blue-800' },
  { value: 'not_selected', label: '미선정', icon: FileText, color: 'bg-red-100 text-red-800' }
];

export const ContestResultInput: React.FC<ContestResultInputProps> = ({
  contestId,
  onSave,
  existingResults = [],
  isLoading = false
}) => {
  const [results, setResults] = useState<ContestResult[]>(existingResults);
  const [isEditing, setIsEditing] = useState(false);
  const [newResult, setNewResult] = useState({
    teamName: '',
    projectTitle: '',
    description: '',
    status: 'winner',
    score: '',
    feedback: '',
    rank: '',
    prizeAmount: '',
    announcementDate: new Date().toISOString().split('T')[0]
  });

  const handleAddResult = () => {
    if (!newResult.teamName || !newResult.projectTitle) {
      alert('팀명과 프로젝트 제목은 필수입니다.');
      return;
    }

    const result: ContestResult = {
      id: crypto.randomUUID(),
      teamName: newResult.teamName,
      projectTitle: newResult.projectTitle,
      description: newResult.description,
      status: newResult.status,
      score: newResult.score ? parseInt(newResult.score) : undefined,
      feedback: newResult.feedback || undefined,
      rank: newResult.rank ? parseInt(newResult.rank) : undefined,
      prizeAmount: newResult.prizeAmount || undefined,
      announcementDate: newResult.announcementDate
    };

    setResults([...results, result]);
    setNewResult({
      teamName: '',
      projectTitle: '',
      description: '',
      status: 'winner',
      score: '',
      feedback: '',
      rank: '',
      prizeAmount: '',
      announcementDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleRemoveResult = (id: string) => {
    setResults(results.filter(result => result.id !== id));
  };

  const handleSave = () => {
    onSave(results);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setResults(existingResults);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* 편집 모드 토글 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">결과 관리</h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              결과 편집
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline">
                취소
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 새 결과 입력 폼 */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              새 결과 추가
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">팀명 *</label>
                <Input
                  value={newResult.teamName}
                  onChange={(e) => setNewResult({...newResult, teamName: e.target.value})}
                  placeholder="팀명을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium">프로젝트 제목 *</label>
                <Input
                  value={newResult.projectTitle}
                  onChange={(e) => setNewResult({...newResult, projectTitle: e.target.value})}
                  placeholder="프로젝트 제목을 입력하세요"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">프로젝트 설명</label>
              <Textarea
                value={newResult.description}
                onChange={(e) => setNewResult({...newResult, description: e.target.value})}
                placeholder="프로젝트에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">결과</label>
                <select
                  value={newResult.status}
                  onChange={(e) => setNewResult({...newResult, status: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  {getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">순위</label>
                <Input
                  type="number"
                  value={newResult.rank}
                  onChange={(e) => setNewResult({...newResult, rank: e.target.value})}
                  placeholder="순위"
                />
              </div>
              <div>
                <label className="text-sm font-medium">점수</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newResult.score}
                  onChange={(e) => setNewResult({...newResult, score: e.target.value})}
                  placeholder="0-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">상금</label>
                <Input
                  value={newResult.prizeAmount}
                  onChange={(e) => setNewResult({...newResult, prizeAmount: e.target.value})}
                  placeholder="예: 500만원"
                />
              </div>
              <div>
                <label className="text-sm font-medium">발표일</label>
                <Input
                  type="date"
                  value={newResult.announcementDate}
                  onChange={(e) => setNewResult({...newResult, announcementDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">심사 피드백</label>
              <Textarea
                value={newResult.feedback}
                onChange={(e) => setNewResult({...newResult, feedback: e.target.value})}
                placeholder="심사 피드백을 입력하세요"
                rows={3}
              />
            </div>

            <Button onClick={handleAddResult} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              결과 추가
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 결과 목록 */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold">등록된 결과 ({results.length}개)</h4>
        {results.map((result) => {
          const statusOption = getStatusOptions().find(opt => opt.value === result.status);
          return (
            <Card key={result.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={statusOption?.color}>
                        {statusOption?.label}
                      </Badge>
                      {result.rank && (
                        <Badge variant="outline">
                          {result.rank}위
                        </Badge>
                      )}
                    </div>
                    
                    <h5 className="font-semibold mb-1">{result.projectTitle}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{result.teamName}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>발표일: {result.announcementDate}</span>
                      {result.prizeAmount && (
                        <span>상금: {result.prizeAmount}</span>
                      )}
                      {result.score && (
                        <span>점수: {result.score}점</span>
                      )}
                    </div>

                    {result.description && (
                      <p className="text-sm mt-2">{result.description}</p>
                    )}

                    {result.feedback && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm font-medium">심사 피드백:</p>
                        <p className="text-sm text-muted-foreground">{result.feedback}</p>
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveResult(result.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>아직 등록된 결과가 없습니다.</p>
            <p className="text-sm mt-2">"결과 편집" 버튼을 클릭하여 결과를 추가해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 