import { NextResponse } from 'next/server';
import { getTopics, getDueFlashcards, updateCardProgress, insertTopic, insertFlashcard } from '@/lib/queries';
import { scrapeAndExtractTopics } from '@/lib/agents/docScraper';
import { generateFlashcardsForTopics } from '@/lib/agents/flashcardEngine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const due = searchParams.get('due');

  try {
    if (due === 'today') {
      const cards = await getDueFlashcards();
      return NextResponse.json({ cards });
    }

    const topics = await getTopics(category || undefined);
    return NextResponse.json({ topics });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Seed endpoint - only in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const topics = await scrapeAndExtractTopics();
    
    for (const topic of topics) {
      const savedTopic = await insertTopic(topic);
      const flashcards = await generateFlashcardsForTopics([savedTopic]);
      
      for (const flashcard of flashcards) {
        await insertFlashcard({ ...flashcard, topic_id: savedTopic.id });
      }
    }

    return NextResponse.json({ 
      success: true, 
      topicsCount: topics.length 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
