import { supabase } from '@/lib/supabase';

export interface Prompt {
  id?: number;
  user_id?: string;
  contest_id: number;
  file_id?: number;
  prompt_type: 'image' | 'document' | 'video' | 'audio' | 'other';
  prompt_text: string;
  ai_model?: string;
  generation_params?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export class PromptService {
  // 프롬프트 목록 조회
  static async getPrompts(contestId: number): Promise<Prompt[]> {
    try {
      const { data, error } = await supabase
        .from('contest_prompts')
        .select('*')
        .eq('contest_id', contestId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPrompts:', error);
      return [];
    }
  }

  // 파일별 프롬프트 조회
  static async getPromptByFileId(fileId: number): Promise<Prompt | null> {
    try {
      const { data, error } = await supabase
        .from('contest_prompts')
        .select('*')
        .eq('file_id', fileId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getPromptByFileId:', error);
      return null;
    }
  }

  // 프롬프트 생성
  static async createPrompt(prompt: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Prompt | null> {
    return this.savePrompt(prompt);
  }

  // 프롬프트 저장
  static async savePrompt(prompt: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Prompt | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 null 반환
        return null;
      }

      const { data, error } = await supabase
        .from('contest_prompts')
        .insert({
          ...prompt,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving prompt:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in savePrompt:', error);
      return null;
    }
  }

  // 프롬프트 업데이트
  static async updatePrompt(promptId: number, updates: Partial<Prompt>): Promise<Prompt | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 null 반환
        return null;
      }

      const { data, error } = await supabase
        .from('contest_prompts')
        .update(updates)
        .eq('id', promptId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating prompt:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePrompt:', error);
      return null;
    }
  }

  // 프롬프트 삭제
  static async deletePrompt(promptId: number, contestId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // 인증된 사용자가 없으면 false 반환
        return false;
      }

      const { error } = await supabase
        .from('contest_prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting prompt:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePrompt:', error);
      return false;
    }
  }

  // AI 모델별 프롬프트 템플릿
  static getPromptTemplates(promptType: string): Record<string, string> {
    const templates = {
      image: {
        'dall-e': 'Create a professional image for a contest submission with the following requirements: {description}. Style: {style}, Colors: {colors}, Composition: {composition}',
        'midjourney': 'Generate a high-quality image for contest submission: {description} --ar {aspect_ratio} --style {style} --quality {quality}',
        'stable-diffusion': 'Create an image for contest: {description}, style: {style}, negative_prompt: {negative_prompt}'
      },
      document: {
        'gpt-4': 'Write a professional document for contest submission. Topic: {topic}, Format: {format}, Length: {length}, Tone: {tone}',
        'claude': 'Create a well-structured document for contest: {topic}. Requirements: {requirements}, Style: {style}',
        'gemini': 'Generate a contest submission document about: {topic}. Include: {sections}, Target audience: {audience}'
      },
      video: {
        'runway': 'Create a video for contest submission: {description}, Duration: {duration}, Style: {style}, Music: {music}',
        'pika': 'Generate a video: {description} --ar {aspect_ratio} --duration {duration} --style {style}',
        'sora': 'Create a video for contest: {description}, style: {style}, duration: {duration}'
      },
      audio: {
        'elevenlabs': 'Generate audio for contest: {description}, Voice: {voice}, Emotion: {emotion}, Duration: {duration}',
        'suno': 'Create music for contest: {description}, Genre: {genre}, Mood: {mood}, Duration: {duration}',
        'udio': 'Generate audio content: {description}, Style: {style}, Length: {length}'
      }
    };

    return templates[promptType as keyof typeof templates] || {};
  }

  // 프롬프트 타입별 설명
  static getPromptTypeDescription(promptType: string): string {
    const descriptions = {
      image: '이미지 생성 (로고, 일러스트, 포스터 등)',
      document: '문서 생성 (기획서, 보고서, 제안서 등)',
      video: '비디오 생성 (프로모션 영상, 설명 영상 등)',
      audio: '오디오 생성 (음악, 내레이션, 효과음 등)',
      other: '기타 생성물'
    };

    return descriptions[promptType as keyof typeof descriptions] || '기타 생성물';
  }
} 