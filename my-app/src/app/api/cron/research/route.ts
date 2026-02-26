import { NextResponse } from 'next/server';
import { researchNewTopics } from '@/lib/agents/cronResearcher';
import { generateFlashcards } from '@/lib/agents/openai';
import { query, isDatabaseConfigured } from '@/lib/db';
import { Category } from '@/types';

const CATEGORIES: Category[] = [
  'react-hooks',
  'nextjs-core',
  'third-party-api',
  'server-side',
  'advanced',
  'ai-integration',
];

/**
 * Cron endpoint to trigger research agent
 * Runs every 72 hours to inject new topics
 */
export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check database
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    console.log('Starting cron research job...');

    // Pick a random category to research
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    console.log(`Researching category: ${category}`);

    // Research new topics from GitHub
    const newTopics = await researchNewTopics(category, 2);

    if (newTopics.length === 0) {
      return NextResponse.json({
        success: true,
        topics_added: 0,
        message: 'No new topics found',
      });
    }

    // Insert topics into database
    const insertedTopics = [];
    for (const topic of newTopics) {
      const result = await query(
        `INSERT INTO topics (
          title, slug, category, difficulty, plain_english_summary,
          when_to_use, when_not_to_use, code_snippet, code_explanation,
          real_world_example, gotchas, related_topic_ids, source_urls,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (slug) DO NOTHING
        RETURNING *`,
        [
          topic.title,
          topic.slug || topic.title.toLowerCase().replace(/\s+/g, '-'),
          topic.category,
          topic.difficulty,
          topic.plain_english_summary,
          topic.when_to_use,
          topic.when_not_to_use,
          topic.code_snippet,
          topic.code_explanation,
          topic.real_world_example,
          JSON.stringify(topic.gotchas || []),
          JSON.stringify(topic.related_topic_ids || []),
          JSON.stringify(topic.source_urls || []),
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      
      if (result.rows[0]) {
        insertedTopics.push(result.rows[0]);
      }
    }

    // Generate and insert flashcards for new topics
    let flashcardsInserted = 0;

    for (const topic of insertedTopics) {
      console.log(`Generating flashcards for: ${topic.title} (id: ${topic.id})`);
      
      try {
        const result = await generateFlashcards(topic);

        if (result.flashcards?.length) {
          for (const f of result.flashcards) {
            const flashcardId = crypto.randomUUID();
            
            await query(
              `INSERT INTO flashcards (
                id, topic_id, card_front, card_back, difficulty,
                has_code_snippet, code_snippet, memory_hook, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                flashcardId,
                topic.id,  // Now topic.id exists from DB
                f.card_front,
                f.card_back,
                f.difficulty,
                !!f.code_snippet,
                f.code_snippet,
                f.memory_hook,
                new Date().toISOString(),
              ]
            );
            flashcardsInserted++;

            // Create initial progress record
            await query(
              `INSERT INTO user_card_progress (
                card_id, repetition, interval_days, easiness_factor,
                last_reviewed_at, next_review_date, total_reviews, quality_history, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (card_id) DO NOTHING`,
              [
                flashcardId,
                0,
                1,
                2.5,
                null,
                null,
                0,
                '[]',
                new Date().toISOString(),
              ]
            );
          }
        }
      } catch (error) {
        console.error(`Error generating flashcards for ${topic.title}:`, error);
      }
    }

    console.log(`Inserted ${insertedTopics.length} topics and ${flashcardsInserted} flashcards`);

    return NextResponse.json({
      success: true,
      topics_added: insertedTopics.length,
      flashcards_added: flashcardsInserted,
      topics: insertedTopics.map(t => t.title),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron research error:', error);
    return NextResponse.json(
      { error: 'Research job failed', details: String(error) },
      { status: 500 }
    );
  }
}
