export type Category = 
  | 'react-hooks'
  | 'nextjs-core'
  | 'third-party-api'
  | 'server-side'
  | 'advanced'
  | 'ai-integration';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type CardDifficulty = 'easy' | 'medium' | 'hard';

export interface Topic {
  id: string;
  title: string;
  slug: string;
  category: Category;
  difficulty: Difficulty;
  plain_english_summary: string;
  when_to_use: string;
  when_not_to_use: string;
  code_snippet: string;
  code_explanation: string;
  real_world_example: string;
  gotchas: string[];
  related_topic_ids: string[];
  source_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  topic_id: string;
  card_front: string;
  card_back: string;
  difficulty: CardDifficulty;
  has_code_snippet: boolean;
  code_snippet: string | null;
  memory_hook: string;
  created_at: string;
}

export interface SM2State {
  repetition: number;
  interval: number;
  easinessFactor: number;
}

export interface UserCardProgress {
  id: string;
  user_id: string;
  card_id: string;
  repetition: number;
  interval_days: number;
  easiness_factor: number;
  last_reviewed_at: string | null;
  next_review_date: string | null;
  total_reviews: number;
  quality_history: number[];
  created_at: string;
}

export interface FlashcardWithProgress extends Flashcard {
  progress?: UserCardProgress;
}

export interface TopicVisit {
  id: string;
  user_id: string;
  topic_id: string;
  visited_at: string;
  time_spent_seconds: number;
}

export const CATEGORY_CONFIG: Record<Category, { label: string; color: string; borderColor: string; bgColor: string }> = {
  'react-hooks': {
    label: 'React Hooks',
    color: '#22d3ee',
    borderColor: 'border-cyan-400',
    bgColor: 'bg-cyan-400/10',
  },
  'nextjs-core': {
    label: 'Next.js Core',
    color: '#6366f1',
    borderColor: 'border-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  'third-party-api': {
    label: 'Third-Party API',
    color: '#34d399',
    borderColor: 'border-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
  'server-side': {
    label: 'Server-Side',
    color: '#a78bfa',
    borderColor: 'border-violet-400',
    bgColor: 'bg-violet-400/10',
  },
  'advanced': {
    label: 'Advanced',
    color: '#fb923c',
    borderColor: 'border-orange-400',
    bgColor: 'bg-orange-400/10',
  },
  'ai-integration': {
    label: 'AI Integration',
    color: '#fb7185',
    borderColor: 'border-rose-400',
    bgColor: 'bg-rose-400/10',
  },
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};
