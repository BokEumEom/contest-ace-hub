import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client if environment variables are not set
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase environment variables not found. API keys will be stored in localStorage.');
  // Create a mock client for fallback
  supabase = {
    auth: {
      getUser: async () => ({ data: { user: null } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      insert: async () => ({ error: null }),
      update: async () => ({ eq: async () => ({ error: null }) }),
      delete: async () => ({ eq: async () => ({ error: null }) })
    })
  };
}

export { supabase };

// Database types for API keys
export interface ApiKey {
  id?: number;
  user_id?: string;
  key_type: 'gemini' | 'firecrawl';
  api_key: string;
  created_at?: string;
  updated_at?: string;
}

// Helper functions for API key management
export const apiKeyService = {
  async saveApiKey(keyType: 'gemini' | 'firecrawl', apiKey: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // If no user is authenticated, fall back to localStorage
      if (!userId) {
        console.warn('No authenticated user found, falling back to localStorage');
        localStorage.setItem(`${keyType}_api_key`, apiKey);
        return;
      }

      // Check if key already exists
      const { data: existingKey } = await supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', userId)
        .eq('key_type', keyType)
        .single();

      if (existingKey) {
        // Update existing key
        const { error } = await supabase
          .from('api_keys')
          .update({ 
            api_key: apiKey,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingKey.id);

        if (error) throw error;
      } else {
        // Insert new key
        const { error } = await supabase
          .from('api_keys')
          .insert({
            user_id: userId,
            key_type: keyType,
            api_key: apiKey
          });

        if (error) throw error;
      }

      console.log(`${keyType} API key saved successfully`);
    } catch (error) {
      console.error(`Error saving ${keyType} API key:`, error);
      throw error;
    }
  },

  async getApiKey(keyType: 'gemini' | 'firecrawl'): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // If no user is authenticated, fall back to localStorage
      if (!userId) {
        console.warn('No authenticated user found, falling back to localStorage');
        return localStorage.getItem(`${keyType}_api_key`);
      }

      const { data, error } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', userId)
        .eq('key_type', keyType)
        .single();

      if (error || !data) {
        return null;
      }

      return data.api_key;
    } catch (error) {
      console.error(`Error getting ${keyType} API key:`, error);
      return null;
    }
  },

  async deleteApiKey(keyType: 'gemini' | 'firecrawl'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // If no user is authenticated, fall back to localStorage
      if (!userId) {
        console.warn('No authenticated user found, falling back to localStorage');
        localStorage.removeItem(`${keyType}_api_key`);
        return;
      }

      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', userId)
        .eq('key_type', keyType);

      if (error) throw error;

      console.log(`${keyType} API key deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${keyType} API key:`, error);
      throw error;
    }
  }
}; 