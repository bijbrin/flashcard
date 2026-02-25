import { NextResponse } from 'next/server';
import { scrapeAndExtractTopics } from '@/lib/agents/docScraper';
import { generateFlashcardsForTopics } from '@/lib/agents/flashcardEngine';

/**
 * Seed endpoint to populate initial topics
 * Only available in development
 */
export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    console.log('Starting seed process...');

    // Scrape docs and extract topics
    const topics = await scrapeAndExtractTopics();

    if (topics.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No topics extracted',
      });
    }

    // Generate flashcards
    const flashcards = await generateFlashcardsForTopics(topics);

    // TODO: Insert into database
    console.log(`Seeded ${topics.length} topics and ${flashcards.length} flashcards`);

    return NextResponse.json({
      success: true,
      topics_count: topics.length,
      flashcards_count: flashcards.length,
      topics: topics.map(t => ({ title: t.title, category: t.category })),
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seed failed', details: String(error) },
      { status: 500 }
    );
  }
}
