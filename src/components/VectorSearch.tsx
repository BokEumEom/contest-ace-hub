import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { VectorSearchService } from '@/services/vectorSearchService';
import { Search, Sparkles, Target, TrendingUp } from 'lucide-react';

interface VectorSearchProps {
  onContestSelect?: (contest: any) => void;
}

const VectorSearch: React.FC<VectorSearchProps> = ({ onContestSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    'IT/기술',
    '디자인',
    '창업/비즈니스',
    '마케팅',
    '기타'
  ];

  // 벡터 검색 실행
  const handleVectorSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "오류",
        description: "검색어를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await VectorSearchService.searchSimilarContests(
        searchQuery,
        10,
        category || undefined
      );

      setSearchResults(results);
      toast({
        title: "검색 완료",
        description: `${results.length}개의 유사한 공모전을 찾았습니다.`
      });
    } catch (error) {
      console.error('Vector search error:', error);
      toast({
        title: "오류",
        description: "검색 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 개인화 추천 받기
  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      // 임시 사용자 프로필 (실제로는 사용자 설정에서 가져와야 함)
      const userProfile = {
        interests: ['AI', '웹개발', '디자인'],
        skills: ['React', 'TypeScript', 'Figma'],
        preferredCategories: ['IT/기술', '디자인'],
        completedContests: ['1', '2'] // 완료한 공모전 ID들
      };

      const results = await VectorSearchService.recommendContests(userProfile, 10);
      setRecommendations(results);
      toast({
        title: "추천 완료",
        description: `${results.length}개의 맞춤 공모전을 추천합니다.`
      });
    } catch (error) {
      console.error('Recommendation error:', error);
      toast({
        title: "오류",
        description: "추천 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 검색 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI 기반 공모전 검색
          </CardTitle>
          <CardDescription>
            자연어로 원하는 공모전을 검색하고 유사한 공모전을 찾아보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">검색어</label>
              <Input
                placeholder="예: AI 기반 웹 서비스 개발"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체 카테고리</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">검색</label>
              <Button
                onClick={handleVectorSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isLoading ? '검색 중...' : 'AI 검색'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 개인화 추천 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            맞춤 공모전 추천
          </CardTitle>
          <CardDescription>
            사용자의 관심사와 기술스택을 기반으로 개인화된 공모전을 추천합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGetRecommendations}
            disabled={isLoading}
            className="contest-button-primary"
          >
            {isLoading ? (
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            {isLoading ? '추천 생성 중...' : '맞춤 추천 받기'}
          </Button>
        </CardContent>
      </Card>

      {/* 검색 결과 */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>검색 결과 ({searchResults.length}개)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{result.contest.title}</h4>
                    <Badge variant="secondary" className="ml-2">
                      {(result.similarity * 100).toFixed(1)}% 유사
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.contest.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{result.contest.category}</Badge>
                    <Badge variant="outline">{result.contest.organization}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-blue-600">
                      추천 이유: {result.reason}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => onContestSelect?.(result.contest)}
                    >
                      선택
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 추천 결과 */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>맞춤 추천 ({recommendations.length}개)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{result.contest.title}</h4>
                    <Badge variant="secondary" className="ml-2">
                      {(result.similarity * 100).toFixed(1)}% 매칭
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.contest.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{result.contest.category}</Badge>
                    <Badge variant="outline">{result.contest.organization}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-purple-600">
                      추천 이유: {result.reason}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => onContestSelect?.(result.contest)}
                    >
                      선택
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VectorSearch; 