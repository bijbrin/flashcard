import { NextResponse } from 'next/server';
import { researchNewTopics } from '@/lib/agents/cronResearcher';
import { generateFlashcardsForTopics } from '@/lib/agents/flashcardEngine';
import { insertTopic, insertFlashcard } from '@/lib/queries';
import { Category } from '@/types';

const TARGET_PER_CATEGORY = 2;
const CATEGORIES: Category[] = [
  'react-hooks',
  'nextjs-core', 
  'third-party-api',
  'server-side',
  'advanced',
  'ai-integration'
];

export async function POST(request: Request) {
  // Check API keys
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ 
      error: 'OPENAI_API_KEY not configured',
      message: 'Please add OPENAI_API_KEY to environment variables'
    }, { status: 500 });
  }

  // Verify secret
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting research job...');
    
    const results: { category: string; topics: string[] }[] = [];
    
    for (const category of CATEGORIES) {
      console.log(`Researching ${category}...`);
      
      try {
        const topics = await researchNewTopics(category, TARGET_PER_CATEGORY);
        const addedTopics: string[] = [];
        
        for (const topicData of topics) {
          try {
            const topic = await insertTopic({
              title: topicData.title,
              slug: topicData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50),
              category,
              difficulty: topicData.difficulty || 3,
              plain_english_summary: topicData.plain_english_summary || topicData.why_it_matters || '',
              when_to_use: topicData.when_to_use || topicData.better_approach || '',
              when_not_to_use: topicData.when_not_to_use || topicData.common_approach || '',
              code_snippet: topicData.code_snippet || '',
              code_explanation: topicData.code_explanation || '',
              real_world_example: topicData.real_world_example || '',
              gotchas: topicData.gotchas || [],
              source_urls: topicData.source_urls || ['https://github.com'],
            });
            
            addedTopics.push(topic.title);
            
            // Generate flashcards
            const flashcards = await generateFlashcardsForTopics([topic]);
            for (const flashcard of flashcards) {
              await insertFlashcard({ ...flashcard, topic_id: topic.id });
            }
          } catch (e) {
            console.error(`Failed to insert topic: ${topicData.title}`, e);
          }
        }
        
        results.push({ category, topics: addedTopics });
      } catch (e) {
        console.error(`Failed to research ${category}:`, e);
        results.push({ category, topics: [] });
      }
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
