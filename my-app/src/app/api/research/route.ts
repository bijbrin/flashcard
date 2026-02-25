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

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        sendProgress({ type: 'start', total: CATEGORIES.length });
        
        const results: { category: string; topics: string[] }[] = [];
        
        for (let i = 0; i < CATEGORIES.length; i++) {
          const category = CATEGORIES[i];
          
          sendProgress({ 
            type: 'progress', 
            category, 
            completed: i, 
            total: CATEGORIES.length,
            percentage: Math.round((i / CATEGORIES.length) * 100)
          });
          
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

        sendProgress({ 
          type: 'complete', 
          topics_added: totalAdded,
          details: results,
          percentage: 100
        });
        
        controller.close();
      } catch (error) {
        sendProgress({ type: 'error', error: String(error) });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
