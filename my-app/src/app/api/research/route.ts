import { NextResponse } from 'next/server';
import { researchNewTopics } from '@/lib/agents/cronResearcher';
import { generateFlashcardsForTopics } from '@/lib/agents/flashcardEngine';
import { insertTopic, insertFlashcard } from '@/lib/queries';
import { CATEGORY_CONFIG, Category } from '@/types';

const TARGET_PER_CATEGORY = 2; // 2 topics per category = 12 total
const CATEGORIES: Category[] = [
  'react-hooks',
  'nextjs-core', 
  'third-party-api',
  'server-side',
  'advanced',
  'ai-integration'
];

/**
 * Research and add new topics with balanced distribution
 */
export async function POST(request: Request) {
  // Verify secret
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting research job...');
    
    const results: { category: string; topics: string[] }[] = [];
    
    // Research for each category
    for (const category of CATEGORIES) {
      console.log(`Researching ${category}...`);
      
      const topics = await researchNewTopics(category, TARGET_PER_CATEGORY);
      const addedTopics: string[] = [];
      
      for (const topicData of topics) {
        try {
          // Insert topic
          const topic = await insertTopic({
            ...topicData,
            category,
            slug: topicData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          });
          
          addedTopics.push(topic.title);
          
          // Generate and insert flashcards
          const flashcards = await generateFlashcardsForTopics([topic]);
          for (const flashcard of flashcards) {
            await insertFlashcard({ ...flashcard, topic_id: topic.id });
          }
        } catch (e) {
          console.error(`Failed to insert topic: ${topicData.title}`, e);
        }
      }
      
      results.push({ category, topics: addedTopics });
    }

    const totalAdded = results.reduce((sum, r) => sum + r.topics.length, 0);

    return NextResponse.json({
      success: true,
      topics_added: totalAdded,
      details: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Research job failed', details: String(error) },
      { status: 500 }
    );
  }
}
