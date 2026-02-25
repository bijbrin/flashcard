import { NextResponse } from 'next/server';
import { researchNewTopics } from '@/lib/agents/cronResearcher';
import { generateFlashcardsForTopics } from '@/lib/agents/flashcardEngine';

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

  try {
    console.log('Starting cron research job...');

    // Research new topics from GitHub
    const newTopics = await researchNewTopics();

    if (newTopics.length === 0) {
      return NextResponse.json({
        success: true,
        topics_added: 0,
        message: 'No new topics found',
      });
    }

    // Generate flashcards for new topics
    const flashcards = await generateFlashcardsForTopics(newTopics);

    // TODO: Insert into database
    console.log(`Generated ${newTopics.length} topics and ${flashcards.length} flashcards`);

    return NextResponse.json({
      success: true,
      topics_added: newTopics.length,
      flashcards_added: flashcards.length,
      topics: newTopics.map(t => t.title),
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
