import { supabase } from '@/lib/supabase';
import { GeminiService } from './geminiService';

interface ContestEmbedding {
  id: string;
  title: string;
  description: string;
  category: string;
  organization: string;
  contest_theme: string;
  submission_format: string;
  embedding: number[];
  similarity?: number;
}

interface SearchResult {
  contest: ContestEmbedding;
  similarity: number;
  reason: string;
}

export class VectorSearchService {
  private static readonly EMBEDDING_MODEL = 'text-embedding-3-small';
  private static readonly SIMILARITY_THRESHOLD = 0.7;

  // 공모전 텍스트를 임베딩으로 변환
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const geminiApiKey = await GeminiService.getApiKey();
      if (!geminiApiKey) {
        throw new Error('Gemini API key not found');
      }

      // OpenAI Embeddings API 사용 (Gemini는 임베딩 API가 없으므로)
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${geminiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: this.EMBEDDING_MODEL,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate embedding');
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  // 공모전을 벡터 데이터베이스에 저장
  static async storeContestEmbedding(contest: any): Promise<void> {
    try {
      // 공모전 텍스트 생성
      const contestText = `
        제목: ${contest.title}
        설명: ${contest.description || ''}
        카테고리: ${contest.category || ''}
        주최기관: ${contest.organization || ''}
        공모주제: ${contest.contest_theme || ''}
        제출형식: ${contest.submission_format || ''}
        상금: ${contest.prize || ''}
      `.trim();

      // 임베딩 생성
      const embedding = await this.generateEmbedding(contestText);

      // Supabase에 저장
      const { error } = await supabase
        .from('contest_embeddings')
        .insert({
          contest_id: contest.id,
          title: contest.title,
          description: contest.description,
          category: contest.category,
          organization: contest.organization,
          contest_theme: contest.contest_theme,
          submission_format: contest.submission_format,
          embedding: embedding,
        });

      if (error) throw error;
      console.log('Contest embedding stored successfully');
    } catch (error) {
      console.error('Error storing contest embedding:', error);
      throw error;
    }
  }

  // 유사한 공모전 검색
  static async searchSimilarContests(
    query: string,
    limit: number = 10,
    category?: string
  ): Promise<SearchResult[]> {
    try {
      // 쿼리 임베딩 생성
      const queryEmbedding = await this.generateEmbedding(query);

      // pgvector 함수를 사용한 효율적인 유사도 검색
      let { data: results, error } = await supabase.rpc(
        category ? 'match_contests_by_category' : 'match_contests',
        {
          query_embedding: queryEmbedding,
          match_threshold: this.SIMILARITY_THRESHOLD,
          match_count: limit,
          ...(category && { target_category: category })
        }
      );

      if (error) throw error;

      // 결과를 SearchResult 형식으로 변환
      return (results || []).map(result => ({
        contest: {
          id: result.id,
          contest_id: result.contest_id,
          title: result.title,
          description: result.description,
          category: result.category,
          organization: result.organization,
          contest_theme: result.contest_theme,
          submission_format: result.submission_format,
          embedding: [], // 실제 임베딩은 필요하지 않음
          similarity: result.similarity
        },
        similarity: result.similarity,
        reason: this.generateSimilarityReason(query, {
          id: result.id,
          title: result.title,
          description: result.description,
          category: result.category,
          organization: result.organization,
          contest_theme: result.contest_theme,
          submission_format: result.submission_format,
          embedding: []
        })
      }));
    } catch (error) {
      console.error('Error searching similar contests:', error);
      return [];
    }
  }

  // 사용자 프로필 기반 공모전 추천
  static async recommendContests(
    userProfile: {
      interests: string[];
      skills: string[];
      preferredCategories: string[];
      completedContests: string[];
    },
    limit: number = 10
  ): Promise<SearchResult[]> {
    try {
      // 사용자 프로필을 텍스트로 변환
      const profileText = `
        관심사: ${userProfile.interests.join(', ')}
        기술스택: ${userProfile.skills.join(', ')}
        선호카테고리: ${userProfile.preferredCategories.join(', ')}
        완료한공모전: ${userProfile.completedContests.join(', ')}
      `.trim();

      // 프로필 임베딩 생성
      const profileEmbedding = await this.generateEmbedding(profileText);

      // pgvector 함수를 사용한 효율적인 추천 검색
      const { data: results, error } = await supabase.rpc('match_contests', {
        query_embedding: profileEmbedding,
        match_threshold: this.SIMILARITY_THRESHOLD,
        match_count: limit * 2 // 더 많은 결과를 가져와서 필터링
      });

      if (error) throw error;

      // 완료한 공모전 제외하고 추천 이유 생성
      const recommendations = (results || [])
        .filter(result => !userProfile.completedContests.includes(result.contest_id.toString()))
        .map(result => ({
          contest: {
            id: result.id,
            contest_id: result.contest_id,
            title: result.title,
            description: result.description,
            category: result.category,
            organization: result.organization,
            contest_theme: result.contest_theme,
            submission_format: result.submission_format,
            embedding: [],
            similarity: result.similarity
          },
          similarity: result.similarity,
          reason: this.generateRecommendationReason(userProfile, {
            id: result.id,
            title: result.title,
            description: result.description,
            category: result.category,
            organization: result.organization,
            contest_theme: result.contest_theme,
            submission_format: result.submission_format,
            embedding: []
          })
        }))
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error recommending contests:', error);
      return [];
    }
  }



  // 유사도 이유 생성
  private static generateSimilarityReason(query: string, contest: ContestEmbedding): string {
    const reasons = [];
    
    if (query.toLowerCase().includes(contest.category?.toLowerCase() || '')) {
      reasons.push('카테고리 일치');
    }
    
    if (query.toLowerCase().includes(contest.organization?.toLowerCase() || '')) {
      reasons.push('주최기관 일치');
    }
    
    if (contest.contest_theme && query.toLowerCase().includes(contest.contest_theme.toLowerCase())) {
      reasons.push('공모주제 일치');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : '내용 유사성';
  }

  // 추천 이유 생성
  private static generateRecommendationReason(
    userProfile: any,
    contest: ContestEmbedding
  ): string {
    const reasons = [];
    
    if (userProfile.preferredCategories.includes(contest.category)) {
      reasons.push('선호 카테고리');
    }
    
    if (userProfile.interests.some(interest => 
      contest.contest_theme?.toLowerCase().includes(interest.toLowerCase())
    )) {
      reasons.push('관심사 일치');
    }
    
    if (userProfile.skills.some(skill => 
      contest.submission_format?.toLowerCase().includes(skill.toLowerCase())
    )) {
      reasons.push('기술스택 일치');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : '개인화 추천';
  }

  // 벡터 데이터베이스 초기화
  static async initializeVectorDatabase(): Promise<void> {
    try {
      // 기존 공모전들을 벡터화
      const { data: contests, error } = await supabase
        .from('contests')
        .select('*');

      if (error) throw error;

      for (const contest of contests || []) {
        await this.storeContestEmbedding(contest);
      }

      console.log('Vector database initialized successfully');
    } catch (error) {
      console.error('Error initializing vector database:', error);
      throw error;
    }
  }
} 