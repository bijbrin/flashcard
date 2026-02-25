import { generateFlashcards } from './kimi';
import { Flashcard } from '@/types';

/**
 * Generate flashcards for a list of topics
 */
export async function generateFlashcardsForTopics(topics: any[]): Promise<Flashcard[]> {
  const allFlashcards: Flashcard[] = [];

  for (const topic of topics) {
    try {
      console.log(`Generating flashcards for: ${topic.title}`);
      
      const result = await generateFlashcards(topic);

      if (result.flashcards?.length) {
        const flashcards = result.flashcards.map((f: any) => ({
          ...f,
          id: crypto.randomUUID(),
          topic_id: topic.id,
          has_code_snippet: !!f.code_snippet,
          created_at: new Date().toISOString(),
        }));

        allFlashcards.push(...flashcards);
      }
    } catch (error) {
      console.error(`Error generating flashcards for ${topic.title}:`, error);
    }
  }

  return allFlashcards;
}
