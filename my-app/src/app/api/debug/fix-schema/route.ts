import { NextResponse } from 'next/server';
import { query, isDatabaseConfigured } from '@/lib/db';

/**
 * Fix database schema - add missing columns if they don't exist
 * POST /api/debug/fix-schema
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const fixes = [];

    // Check and add created_at to topics if missing
    try {
      await query('SELECT created_at FROM topics LIMIT 1');
      fixes.push('topics.created_at: already exists');
    } catch {
      await query('ALTER TABLE topics ADD COLUMN created_at timestamptz DEFAULT now()');
      fixes.push('topics.created_at: added');
    }

    // Check and add updated_at to topics if missing
    try {
      await query('SELECT updated_at FROM topics LIMIT 1');
      fixes.push('topics.updated_at: already exists');
    } catch {
      await query('ALTER TABLE topics ADD COLUMN updated_at timestamptz DEFAULT now()');
      fixes.push('topics.updated_at: added');
    }

    // Check and add created_at to flashcards if missing
    try {
      await query('SELECT created_at FROM flashcards LIMIT 1');
      fixes.push('flashcards.created_at: already exists');
    } catch {
      await query('ALTER TABLE flashcards ADD COLUMN created_at timestamptz DEFAULT now()');
      fixes.push('flashcards.created_at: added');
    }

    // Check and add created_at to user_card_progress if missing
    try {
      await query('SELECT created_at FROM user_card_progress LIMIT 1');
      fixes.push('user_card_progress.created_at: already exists');
    } catch {
      await query('ALTER TABLE user_card_progress ADD COLUMN created_at timestamptz DEFAULT now()');
      fixes.push('user_card_progress.created_at: added');
    }

    return NextResponse.json({
      success: true,
      message: 'Schema fixes applied',
      fixes,
    });

  } catch (error: any) {
    console.error('Schema fix error:', error);
    return NextResponse.json(
      { error: 'Schema fix failed', details: error.message },
      { status: 500 }
    );
  }
}
