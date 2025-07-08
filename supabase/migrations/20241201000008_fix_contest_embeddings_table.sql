-- Fix contest_embeddings table structure
-- Migration: 20241201000008_fix_contest_embeddings_table.sql

-- Drop existing table and functions
DROP TRIGGER IF EXISTS create_contest_embedding_trigger ON contests;
DROP FUNCTION IF EXISTS create_contest_embedding();
DROP FUNCTION IF EXISTS match_contests(VECTOR(1536), FLOAT, INT);
DROP FUNCTION IF EXISTS match_contests_by_category(VECTOR(1536), TEXT, FLOAT, INT);
DROP TABLE IF EXISTS contest_embeddings;

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the contest_embeddings table with correct structure
CREATE TABLE IF NOT EXISTS contest_embeddings (
  id BIGSERIAL PRIMARY KEY,
  contest_id BIGINT REFERENCES contests(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  organization TEXT,
  contest_theme TEXT,
  submission_format TEXT,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contest_embeddings_contest_id ON contest_embeddings(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_embeddings_category ON contest_embeddings(category);
CREATE INDEX IF NOT EXISTS idx_contest_embeddings_organization ON contest_embeddings(organization);

-- Create vector similarity search function using pgvector
CREATE OR REPLACE FUNCTION match_contests(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  contest_id BIGINT,
  title TEXT,
  description TEXT,
  category TEXT,
  organization TEXT,
  contest_theme TEXT,
  submission_format TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.contest_id,
    ce.title,
    ce.description,
    ce.category,
    ce.organization,
    ce.contest_theme,
    ce.submission_format,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM contest_embeddings ce
  WHERE 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create optimized vector search function with category filtering
CREATE OR REPLACE FUNCTION match_contests_by_category(
  query_embedding VECTOR(1536),
  target_category TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  contest_id BIGINT,
  title TEXT,
  description TEXT,
  category TEXT,
  organization TEXT,
  contest_theme TEXT,
  submission_format TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.contest_id,
    ce.title,
    ce.description,
    ce.category,
    ce.organization,
    ce.contest_theme,
    ce.submission_format,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM contest_embeddings ce
  WHERE ce.category = target_category
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE contest_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for contest_embeddings
CREATE POLICY "Users can read contest embeddings" ON contest_embeddings
  FOR SELECT USING (true); -- Allow public read access for search

CREATE POLICY "Users can manage their own contest embeddings" ON contest_embeddings
  FOR ALL USING (
    contest_id IN (
      SELECT id FROM contests WHERE user_id = auth.uid()
    )
  );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contest_embeddings_updated_at 
  BEFORE UPDATE ON contest_embeddings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE contest_embeddings IS 'Stores contest embeddings for vector similarity search';
COMMENT ON COLUMN contest_embeddings.contest_id IS 'Reference to the contest';
COMMENT ON COLUMN contest_embeddings.title IS 'Contest title for search';
COMMENT ON COLUMN contest_embeddings.description IS 'Contest description for search';
COMMENT ON COLUMN contest_embeddings.category IS 'Contest category for filtering';
COMMENT ON COLUMN contest_embeddings.organization IS 'Hosting organization for search';
COMMENT ON COLUMN contest_embeddings.contest_theme IS 'Contest theme for search';
COMMENT ON COLUMN contest_embeddings.submission_format IS 'Submission format for search';
COMMENT ON COLUMN contest_embeddings.embedding IS 'Vector embedding for similarity search';

-- Create function to automatically create embeddings when contests are added/updated
CREATE OR REPLACE FUNCTION create_contest_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- This would typically call an external API to generate embeddings
  -- For now, we'll create a placeholder embedding (1536-dimensional zero vector)
  INSERT INTO contest_embeddings (
    contest_id,
    title,
    description,
    category,
    organization,
    contest_theme,
    submission_format,
    embedding
  ) VALUES (
    NEW.id,
    NEW.title,
    NEW.description,
    NEW.category,
    NEW.organization,
    NEW.contest_theme,
    NEW.submission_format,
    ARRAY_FILL(0.0, ARRAY[1536])::VECTOR(1536) -- Placeholder embedding (zero vector)
  )
  ON CONFLICT (contest_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    organization = EXCLUDED.organization,
    contest_theme = EXCLUDED.contest_theme,
    submission_format = EXCLUDED.submission_format,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create embeddings
CREATE TRIGGER create_contest_embedding_trigger
  AFTER INSERT OR UPDATE ON contests
  FOR EACH ROW
  EXECUTE FUNCTION create_contest_embedding(); 