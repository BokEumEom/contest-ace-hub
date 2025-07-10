import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Save, 
  Trash2, 
  Trophy 
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
  { value: 'winner', label: '우승', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'runner-up', label: '준우승', color: 'bg-gray-100 text-gray-800' },
  { value: 'third', label: '3위', color: 'bg-orange-100 text-orange-800' },
  { value: 'shortlisted', label: '최종 후보', color: 'bg-blue-100 text-blue-800' },
  { value: 'participant', label: '참가', color: 'bg-green-100 text-green-800' }
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
            <CardTitle className="text-md">새 결과 추가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">팀명 *</Label>
                <Input
                  id="teamName"
                  value={newResult.teamName}
                  onChange={(e) => setNewResult({...newResult, teamName: e.target.value})}
                  placeholder="팀명을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectTitle">프로젝트 제목 *</Label>
                <Input
                  id="projectTitle"
                  value={newResult.projectTitle}
                  onChange={(e) => setNewResult({...newResult, projectTitle: e.target.value})}
                  placeholder="프로젝트 제목을 입력하세요"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">프로젝트 설명</Label>
              <Textarea
                id="description"
                value={newResult.description}
                onChange={(e) => setNewResult({...newResult, description: e.target.value})}
                placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">결과 상태</Label>
                <select
                  id="status"
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
              
              <div className="space-y-2">
                <Label htmlFor="rank">순위</Label>
                <Input
                  id="rank"
                  type="number"
                  value={newResult.rank}
                  onChange={(e) => setNewResult({...newResult, rank: e.target.value})}
                  placeholder="순위 (숫자)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="score">점수</Label>
                <Input
                  id="score"
                  type="number"
                  value={newResult.score}
                  onChange={(e) => setNewResult({...newResult, score: e.target.value})}
                  placeholder="점수"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prizeAmount">상금</Label>
                <Input
                  id="prizeAmount"
                  value={newResult.prizeAmount}
                  onChange={(e) => setNewResult({...newResult, prizeAmount: e.target.value})}
                  placeholder="상금 금액"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="announcementDate">발표일</Label>
                <Input
                  id="announcementDate"
                  type="date"
                  value={newResult.announcementDate}
                  onChange={(e) => setNewResult({...newResult, announcementDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">심사 피드백</Label>
              <Textarea
                id="feedback"
                value={newResult.feedback}
                onChange={(e) => setNewResult({...newResult, feedback: e.target.value})}
                placeholder="심사위원의 피드백을 입력하세요"
                rows={3}
              />
            </div>

            <Button onClick={handleAddResult} className="w-full">
              <Trophy className="h-4 w-4 mr-2" />
              결과 추가
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 등록된 결과 목록 */}
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