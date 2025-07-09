-- Add prompt column to contest_files table
ALTER TABLE contest_files ADD COLUMN prompt TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN contest_files.prompt IS '프롬프트 정보 (AI 생성 파일의 경우 사용된 프롬프트, 일반 파일의 경우 사용자가 입력한 프롬프트)'; 