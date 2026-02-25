import { query, isDatabaseConfigured } from './db';

const CREATE_TABLES_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Category enum
DO $$ BEGIN
  CREATE TYPE category_enum AS ENUM (
    'react-hooks',
    'nextjs-core',
    'third-party-api',
    'server-side',
    'advanced',
    'ai-integration'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Difficulty enum
DO $$ BEGIN
  CREATE TYPE card_difficulty_enum AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category category_enum NOT NULL,
  difficulty int CHECK (difficulty BETWEEN 1 AND 5),
  plain_english_summary text,
  when_to_use text,
  when_not_to_use text,
  code_snippet text,
  code_explanation text,
  real_world_example text,
  gotchas jsonb DEFAULT '[]',
  related_topic_ids uuid[],
  source_urls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE,
  card_front text NOT NULL,
  card_back text NOT NULL,
  difficulty card_difficulty_enum DEFAULT 'medium',
  has_code_snippet boolean DEFAULT false,
  code_snippet text,
  memory_hook text,
  created_at timestamptz DEFAULT now()
);

-- User card progress table
CREATE TABLE IF NOT EXISTS user_card_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id uuid REFERENCES flashcards(id) ON DELETE CASCADE,
  repetition int DEFAULT 0,
  interval_days int DEFAULT 1,
  easiness_factor float DEFAULT 2.5,
  last_reviewed_at timestamptz,
  next_review_date date,
  total_reviews int DEFAULT 0,
  quality_history int[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(card_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_topics_difficulty ON topics(difficulty);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_card_progress_next_review ON user_card_progress(next_review_date);
`;

export async function initDatabase() {
  if (!isDatabaseConfigured()) {
    console.log('Database not configured, skipping init');
    return;
  }

  try {
    console.log('Initializing database tables...');
    await query(CREATE_TABLES_SQL);
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
