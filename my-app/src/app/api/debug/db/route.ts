import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      status: 'error',
      message: 'DATABASE_URL not configured',
    }, { status: 500 });
  }

  try {
    // Check topics table
    const topicsResult = await query('SELECT COUNT(*) as count FROM topics');
    const topicsCount = parseInt(topicsResult.rows[0].count);

    // Check flashcards table
    const flashcardsResult = await query('SELECT COUNT(*) as count FROM flashcards');
    const flashcardsCount = parseInt(flashcardsResult.rows[0].count);

    // Get recent topics
    const recentTopics = await query('SELECT title, category, created_at FROM topics ORDER BY created_at DESC LIMIT 5');

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      topics_count: topicsCount,
      flashcards_count: flashcardsCount,
      recent_topics: recentTopics.rows,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      detail: error.toString(),
    }, { status: 500 });
  }
}