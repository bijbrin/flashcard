import { query } from './db';
import { Topic, Flashcard, FlashcardWithProgress, UserCardProgress } from '@/types';

export async function getTopics(category?: string): Promise<Topic[]> {
  let sql = 'SELECT * FROM topics';
  const params: string[] = [];
  
  if (category && category !== 'all') {
    sql += ' WHERE category = $1';
    params.push(category);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const result = await query(sql, params);
  return result.rows as Topic[];
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const result = await query('SELECT * FROM topics WHERE slug = $1', [slug]);
  return result.rows[0] as Topic || null;
}

export async function getFlashcardsWithProgress(): Promise<FlashcardWithProgress[]> {
  const result = await query(`
    SELECT f.*, 
      json_build_object(
        'id', ucp.id,
        'card_id', ucp.card_id,
        'repetition', ucp.repetition,
        'interval_days', ucp.interval_days,
        'easiness_factor', ucp.easiness_factor,
        'last_reviewed_at', ucp.last_reviewed_at,
        'next_review_date', ucp.next_review_date,
        'total_reviews', ucp.total_reviews,
        'quality_history', ucp.quality_history,
        'created_at', ucp.created_at
      ) as progress
    FROM flashcards f
    LEFT JOIN user_card_progress ucp ON f.id = ucp.card_id
  `);
  
  return result.rows.map(row => ({
    ...row,
    progress: row.progress?.id ? row.progress : undefined,
  })) as FlashcardWithProgress[];
}

export async function getDueFlashcards(): Promise<FlashcardWithProgress[]> {
  const result = await query(`
    SELECT f.*, 
      json_build_object(
        'id', ucp.id,
        'card_id', ucp.card_id,
        'repetition', ucp.repetition,
        'interval_days', ucp.interval_days,
        'easiness_factor', ucp.easiness_factor,
        'last_reviewed_at', ucp.last_reviewed_at,
        'next_review_date', ucp.next_review_date,
        'total_reviews', ucp.total_reviews,
        'quality_history', ucp.quality_history,
        'created_at', ucp.created_at
      ) as progress
    FROM flashcards f
    JOIN user_card_progress ucp ON f.id = ucp.card_id
    WHERE ucp.next_review_date IS NULL 
       OR ucp.next_review_date <= CURRENT_DATE
    ORDER BY ucp.easiness_factor ASC
  `);
  
  return result.rows.map(row => ({
    ...row,
    progress: row.progress?.id ? row.progress : undefined,
  })) as FlashcardWithProgress[];
}

export async function updateCardProgress(
  cardId: string,
  repetition: number,
  intervalDays: number,
  easinessFactor: number,
  quality: number
): Promise<void> {
  await query(`
    UPDATE user_card_progress 
    SET 
      repetition = $1,
      interval_days = $2,
      easiness_factor = $3,
      last_reviewed_at = CURRENT_TIMESTAMP,
      next_review_date = CURRENT_DATE + INTERVAL '${intervalDays} days',
      total_reviews = total_reviews + 1,
      quality_history = array_append(quality_history, $4)
    WHERE card_id = $5
  `, [repetition, intervalDays, easinessFactor, quality, cardId]);
}

export async function getStats() {
  const topicsResult = await query('SELECT COUNT(*) as total FROM topics');
  const masteredResult = await query(`
    SELECT COUNT(*) as count FROM user_card_progress 
    WHERE interval_days >= 5
  `);
  const dueResult = await query(`
    SELECT COUNT(*) as count FROM user_card_progress 
    WHERE next_review_date IS NULL OR next_review_date <= CURRENT_DATE
  `);
  
  return {
    totalTopics: parseInt(topicsResult.rows[0].total),
    masteredCards: parseInt(masteredResult.rows[0].count),
    dueToday: parseInt(dueResult.rows[0].count),
  };
}

export async function getCategoryDistribution() {
  const result = await query(`
    SELECT category, COUNT(*) as count 
    FROM topics 
    GROUP BY category
  `);
  
  const distribution: Record<string, number> = {};
  result.rows.forEach(row => {
    distribution[row.category] = parseInt(row.count);
  });
  
  return distribution;
}

export async function insertTopic(topic: Partial<Topic>): Promise<Topic> {
  const result = await query(`
    INSERT INTO topics (
      title, slug, category, difficulty, plain_english_summary,
      when_to_use, when_not_to_use, code_snippet, code_explanation,
      real_world_example, gotchas, source_urls
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `, [
    topic.title,
    topic.slug,
    topic.category,
    topic.difficulty,
    topic.plain_english_summary,
    topic.when_to_use,
    topic.when_not_to_use,
    topic.code_snippet,
    topic.code_explanation,
    topic.real_world_example,
    JSON.stringify(topic.gotchas || []),
    topic.source_urls,
  ]);
  
  return result.rows[0] as Topic;
}

export async function insertFlashcard(flashcard: Partial<Flashcard>): Promise<void> {
  await query(`
    INSERT INTO flashcards (
      topic_id, card_front, card_back, difficulty,
      has_code_snippet, code_snippet, memory_hook
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    flashcard.topic_id,
    flashcard.card_front,
    flashcard.card_back,
    flashcard.difficulty,
    flashcard.has_code_snippet,
    flashcard.code_snippet,
    flashcard.memory_hook,
  ]);
  
  // Initialize progress for the new flashcard
  await query(`
    INSERT INTO user_card_progress (card_id, repetition, interval_days, easiness_factor)
    SELECT id, 0, 1, 2.5 FROM flashcards 
    WHERE topic_id = $1 AND card_front = $2
    ON CONFLICT (card_id) DO NOTHING
  `, [flashcard.topic_id, flashcard.card_front]);
}
