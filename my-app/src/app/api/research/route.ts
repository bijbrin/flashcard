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

// Store active research jobs in memory (in production, use Redis)
const activeJobs = new Map<string, {
  status: 'running' | 'completed' | 'error';
  progress: {
    currentCategory?: string;
    categoryCompleted: number;
    categoryTotal: number;
    topicsFound: number;
    flashcardsGenerated: number;
    percentage: number;
    status: string;
  };
  result?: {
    success: boolean;
    topicsAdded: number;
    flashcardsAdded: number;
    message: string;
  };
  startedAt: string;
}>();

// Start a new research job
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

  const jobId = crypto.randomUUID();
  
  // Initialize job
  activeJobs.set(jobId, {
    status: 'running',
    progress: {
      categoryCompleted: 0,
      categoryTotal: CATEGORIES.length,
      topicsFound: 0,
      flashcardsGenerated: 0,
      percentage: 0,
      status: 'Starting research...',
    },
    startedAt: new Date().toISOString(),
  });

  // Start background job
  runResearchJob(jobId);

  return NextResponse.json({ 
    success: true, 
    jobId,
    message: 'Research started in background'
  });
}

// Get job status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    // Return all recent jobs
    const jobs = Array.from(activeJobs.entries()).map(([id, job]) => ({
      jobId: id,
      ...job,
    }));
    return NextResponse.json({ jobs });
  }

  const job = activeJobs.get(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    jobId,
    ...job,
  });
}

// Background research job
async function runResearchJob(jobId: string) {
  const job = activeJobs.get(jobId);
  if (!job) return;

  let totalTopicsAdded = 0;
  let totalFlashcardsAdded = 0;

  try {
    for (let i = 0; i < CATEGORIES.length; i++) {
      const category = CATEGORIES[i];
      
      // Update progress - researching category
      activeJobs.set(jobId, {
        ...job,
        progress: {
          ...job.progress,
          currentCategory: category,
          categoryCompleted: i,
          percentage: Math.round((i / CATEGORIES.length) * 50), // First 50% for research
          status: `Researching ${category}...`,
        },
      });

      try {
        // Research topics for this category
        const topics = await researchNewTopics(category, TARGET_PER_CATEGORY);
        
        let categoryTopicsAdded = 0;
        let categoryFlashcardsAdded = 0;

        for (const topicData of topics) {
          try {
            // Insert topic
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
            
            categoryTopicsAdded++;
            totalTopicsAdded++;

            // Update progress - topic found
            const currentJob = activeJobs.get(jobId);
            if (currentJob) {
              activeJobs.set(jobId, {
                ...currentJob,
                progress: {
                  ...currentJob.progress,
                  topicsFound: totalTopicsAdded,
                  status: `Added topic: ${topic.title.substring(0, 30)}...`,
                },
              });
            }

            // Generate flashcards for this topic
            const flashcards = await generateFlashcardsForTopics([topic]);
            
            for (const flashcard of flashcards) {
              await insertFlashcard({ ...flashcard, topic_id: topic.id });
              categoryFlashcardsAdded++;
              totalFlashcardsAdded++;
            }

            // Update progress - flashcards generated
            const updatedJob = activeJobs.get(jobId);
            if (updatedJob) {
              activeJobs.set(jobId, {
                ...updatedJob,
                progress: {
                  ...updatedJob.progress,
                  flashcardsGenerated: totalFlashcardsAdded,
                  percentage: 50 + Math.round(((i + 0.5) / CATEGORIES.length) * 50), // Second 50% for flashcards
                  status: `Generated ${flashcards.length} flashcards for ${topic.title.substring(0, 25)}...`,
                },
              });
            }
          } catch (e) {
            console.error(`Failed to process topic: ${topicData.title}`, e);
          }
        }
      } catch (e) {
        console.error(`Failed to research ${category}:`, e);
      }
    }

    // Mark job as completed
    const finalJob = activeJobs.get(jobId);
    if (finalJob) {
      activeJobs.set(jobId, {
        ...finalJob,
        status: 'completed',
        progress: {
          ...finalJob.progress,
          categoryCompleted: CATEGORIES.length,
          percentage: 100,
          status: 'Complete!',
        },
        result: {
          success: true,
          topicsAdded: totalTopicsAdded,
          flashcardsAdded: totalFlashcardsAdded,
          message: `Added ${totalTopicsAdded} topics and ${totalFlashcardsAdded} flashcards!`,
        },
      });
    }

    // Clean up old jobs after 1 hour
    setTimeout(() => {
      activeJobs.delete(jobId);
    }, 60 * 60 * 1000);

  } catch (error) {
    const errorJob = activeJobs.get(jobId);
    if (errorJob) {
      activeJobs.set(jobId, {
        ...errorJob,
        status: 'error',
        result: {
          success: false,
          topicsAdded: totalTopicsAdded,
          flashcardsAdded: totalFlashcardsAdded,
          message: `Error: ${String(error)}`,
        },
      });
    }
  }
}