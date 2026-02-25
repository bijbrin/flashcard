/**
 * Kimi Coding API Client
 * Using kimi.com/code API
 */

const KIMI_API_URL = 'https://api.kimi.com/coding/v1';
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';

interface KimiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface KimiCompletionOptions {
  model?: string;
  messages: KimiMessage[];
  temperature?: number;
  max_tokens?: number;
}

export async function kimiCompletion(options: KimiCompletionOptions) {
  const response = await fetch(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || 'kimi-coding',
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kimi API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Extract topics from documentation content
 */
export async function extractTopicsFromDocs(docsContent: string, source: string) {
  const prompt = `You are a technical documentation analyzer. Extract intermediate-to-advanced topics from the following documentation content.

Chain of Thought:
1. Is this topic intermediate or advanced? (Would a junior dev be confused? → YES = include)
2. Does this topic have a real-world use case?
3. Can this become a flashcard with a clear front/back?
4. Is there a code snippet that demonstrates the concept?
Only extract if ALL 4 steps pass.

For each topic, provide:
- title: Clear, specific title
- category: One of [react-hooks, nextjs-core, third-party-api, server-side, advanced, ai-integration]
- difficulty: 3-5 (intermediate to expert)
- plain_english_summary: 2-sentence ELI15 explanation
- when_to_use: Concrete scenarios
- when_not_to_use: Anti-patterns
- code_snippet: Runnable TypeScript code (max 40 lines)
- code_explanation: Line-by-line reasoning
- real_world_example: Production use case
- gotchas: Array of 3 common mistakes

Documentation content:
${docsContent.slice(0, 8000)}

Source: ${source}

Return as JSON array: { topics: [...] }`;

  const result = await kimiCompletion({
    messages: [
      { role: 'system', content: 'You are a technical curriculum designer specializing in React and Next.js. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ],
  });

  // Extract JSON from response (in case there's markdown formatting)
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(result);
}

/**
 * Generate flashcards from a topic
 */
export async function generateFlashcards(topic: any) {
  const prompt = `Generate 2-3 flashcards for this topic using Chain of Thought reasoning.

Topic: ${topic.title}
Summary: ${topic.plain_english_summary}
Code: ${topic.code_snippet}

For EACH card, think through:

STEP 1 — CONCEPT DECOMPOSITION
"What are the 3 core things a developer must know about this topic?"

STEP 2 — QUESTION DESIGN  
"How do I test recall, not just recognition?"
Bad: "What is X?" → triggers word recognition only
Good: Scenario-based question requiring application

STEP 3 — ANSWER ARCHITECTURE
Back of card must contain:
a) Direct answer (1-2 sentences)
b) Code snippet (if applicable, ≤15 lines)
c) Why it works (mechanism explanation)
d) Memory hook (one-liner metaphor or rule-of-thumb)

STEP 4 — DIFFICULTY CALIBRATION
Rate: Easy / Medium / Hard

STEP 5 — VALIDATE
"Would a developer feel genuinely tested after seeing this card?"

Return as JSON: { flashcards: [{ card_front, card_back, difficulty, has_code_snippet, code_snippet, memory_hook }] }`;

  const result = await kimiCompletion({
    messages: [
      { role: 'system', content: 'You are a spaced repetition flashcard designer. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ],
  });

  // Extract JSON from response
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(result);
}

/**
 * Research GitHub for new topics
 */
export async function researchGitHubTopics(query: string) {
  const prompt = `Research Next.js/React development patterns from GitHub discussions and issues.

Search context: ${query}

Extract 3-5 topics that represent REAL developer pain points. For each:
- title: Specific problem/solution name
- difficulty: 3-5
- plain_english_summary: Clear explanation
- why_it_matters: Why developers struggle with this
- common_approach: What most developers do wrong
- better_approach: The production-ready solution
- code_snippet: Correct implementation

Return as JSON: { topics: [...] }`;

  const result = await kimiCompletion({
    messages: [
      { role: 'system', content: 'You are a senior React/Next.js engineer analyzing GitHub trends. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ],
  });

  // Extract JSON from response
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(result);
}
