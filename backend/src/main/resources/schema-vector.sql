-- 1. pgvector 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 비디오 파일 테이블에 임베딩 컬럼 추가 (AI 분석 텍스트/이미지 기반 1536차원 예시)
ALTER TABLE video_files ADD COLUMN IF NOT EXISTS ai_embedding vector(1536);

-- 3. HNSW 인덱스 생성 (코사인 유사도 검색 최적화)
-- 데이터 규모가 커질 경우를 대비해 ivfflat보다 재현율이 높은 hnsw 채택
CREATE INDEX IF NOT EXISTS idx_video_embedding ON video_files USING hnsw (ai_embedding vector_cosine_ops);
