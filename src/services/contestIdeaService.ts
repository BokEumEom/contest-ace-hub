import { supabase } from '@/lib/supabase';
import { ContestIdea } from '@/types/contest';

export class ContestIdeaService {
  static async getIdeas(contestId: string): Promise<ContestIdea[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage
        const stored = localStorage.getItem(`contest_ideas_${contestId}`);
        return stored ? JSON.parse(stored) : [];
      }

      const { data, error } = await supabase
        .from('contest_ideas')
        .select('*')
        .eq('contest_id', contestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contest ideas:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(`contest_ideas_${contestId}`);
      return stored ? JSON.parse(stored) : [];
    }
  }

  static async saveIdea(idea: Omit<ContestIdea, 'id' | 'createdAt'>): Promise<ContestIdea> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage
        const newIdea: ContestIdea = {
          ...idea,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        const existing = await this.getIdeas(idea.contestId);
        const updated = [newIdea, ...existing];
        localStorage.setItem(`contest_ideas_${idea.contestId}`, JSON.stringify(updated));
        return newIdea;
      }

      const { data, error } = await supabase
        .from('contest_ideas')
        .insert({
          contest_id: idea.contestId,
          title: idea.title,
          description: idea.description,
          ai_generated: idea.aiGenerated
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id.toString(),
        contestId: data.contest_id.toString(),
        title: data.title,
        description: data.description,
        aiGenerated: data.ai_generated,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error saving contest idea:', error);
      throw error;
    }
  }

  static async deleteIdea(ideaId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to localStorage - would need contestId to implement properly
        throw new Error('Cannot delete idea without authentication');
      }

      const { error } = await supabase
        .from('contest_ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting contest idea:', error);
      throw error;
    }
  }
} 