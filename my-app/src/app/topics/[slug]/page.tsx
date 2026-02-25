import { notFound } from 'next/navigation';
import { CodeBlock } from '@/components/CodeBlock';
import { CATEGORY_CONFIG, DIFFICULTY_LABELS } from '@/types';
import { getTopicBySlug } from '@/lib/queries';
import { ArrowLeft, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TopicDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const config = CATEGORY_CONFIG[topic.category];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <a
        href="/topics"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to topics
      </a>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.borderColor.replace('border-', 'text-')}`}>
            {config.label}
          </span>
          <span className="text-sm text-zinc-500">
            {DIFFICULTY_LABELS[topic.difficulty]}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-zinc-100">{topic.title}</h1>

        <p className="text-lg text-zinc-400">{topic.plain_english_summary}</p>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="text-emerald-400" size={20} />
          <h2 className="text-lg font-semibold text-zinc-100">When to Use</h2>
        </div>
        <div className="text-zinc-300 whitespace-pre-line">{topic.when_to_use}</div>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-amber-400" size={20} />
          <h2 className="text-lg font-semibold text-zinc-100">When NOT to Use</h2>
        </div>
        <div className="text-zinc-300 whitespace-pre-line">{topic.when_not_to_use}</div>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-blue-400" size={20} />
          <h2 className="text-lg font-semibold text-zinc-100">Code Example</h2>
        </div>
        <CodeBlock code={topic.code_snippet || '// No code example'} />
        
        {topic.code_explanation && (
          <div className="mt-4 p-4 bg-zinc-950/50 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Explanation</h3>
            <div className="text-sm text-zinc-300 whitespace-pre-line">{topic.code_explanation}</div>
          </div>
        )}
      </section>

      {topic.real_world_example && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Real World Example</h2>
          <p className="text-zinc-300">{topic.real_world_example}</p>
        </section>
      )}

      {topic.gotchas && topic.gotchas.length > 0 && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Common Gotchas</h2>
          <ul className="space-y-3">
            {topic.gotchas.map((gotcha: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-zinc-300">
                <span className="text-rose-400 mt-0.5">•</span>
                {gotcha}
              </li>
            ))}
          </ul>
        </section>
      )}

      {topic.source_urls && topic.source_urls.length > 0 && (
        <section className="border-t border-zinc-800 pt-6">
          <h2 className="text-sm font-medium text-zinc-500 mb-3">Sources</h2>
          <ul className="space-y-2">
            {topic.source_urls.map((url: string, i: number) => (
              <li key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
