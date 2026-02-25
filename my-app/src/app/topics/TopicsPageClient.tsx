'use client';

import { useState } from 'react';
import { TopicCard } from '@/components/TopicCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Category, Topic } from '@/types';
import { Sparkles, Loader2 } from 'lucide-react';

interface TopicsPageClientProps {
  initialTopics: Topic[];
}

const CATEGORIES: Category[] = [
  'react-hooks',
  'nextjs-core', 
  'third-party-api',
  'server-side',
  'advanced',
  'ai-integration'
];

const CATEGORY_LABELS: Record<Category, string> = {
  'react-hooks': 'React Hooks',
  'nextjs-core': 'Next.js Core',
  'third-party-api': 'Third-Party API',
  'server-side': 'Server-Side',
  'advanced': 'Advanced',
  'ai-integration': 'AI Integration',
};

export function TopicsPageClient({ initialTopics }: TopicsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState<{
    currentCategory?: string;
    completed: number;
    total: number;
    percentage: number;
    status: string;
  } | null>(null);
  const [researchResult, setResearchResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const filteredTopics = activeCategory === 'all'
    ? topics
    : topics.filter(t => t.category === activeCategory);

  const categoryCounts = {
    all: topics.length,
    'react-hooks': topics.filter(t => t.category === 'react-hooks').length,
    'nextjs-core': topics.filter(t => t.category === 'nextjs-core').length,
    'third-party-api': topics.filter(t => t.category === 'third-party-api').length,
    'server-side': topics.filter(t => t.category === 'server-side').length,
    'advanced': topics.filter(t => t.category === 'advanced').length,
    'ai-integration': topics.filter(t => t.category === 'ai-integration').length,
  };

  const handleResearch = async () => {
    setIsResearching(true);
    setResearchResult(null);
    setResearchProgress({ completed: 0, total: CATEGORIES.length, percentage: 0, status: 'Starting...' });
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-secret',
        },
      });
      
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setResearchProgress({
                  currentCategory: data.category,
                  completed: data.completed,
                  total: data.total,
                  percentage: data.percentage,
                  status: `Researching ${CATEGORY_LABELS[data.category as Category]}...`,
                });
              } else if (data.type === 'complete') {
                setResearchProgress({
                  completed: CATEGORIES.length,
                  total: CATEGORIES.length,
                  percentage: 100,
                  status: 'Complete!',
                });
                setResearchResult({
                  success: true,
                  message: `Added ${data.topics_added} new topics!`,
                });
                setTimeout(() => window.location.reload(), 2000);
              } else if (data.type === 'error') {
                setResearchResult({
                  success: false,
                  message: data.error || 'Research failed',
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      setResearchResult({
        success: false,
        message: 'Network error',
      });
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Topics</h1>
          <p className="text-zinc-400">
            {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <button
          onClick={handleResearch}
          disabled={isResearching}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-medium rounded-xl transition-colors"
        >
          {isResearching ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Research New Topics
            </>
          )}
        </button>
      </div>

      {researchProgress && isResearching && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-300">{researchProgress.status}</span>
            <span className="text-sm text-indigo-400 font-medium">{researchProgress.percentage}%</span>
          </div>
          
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${researchProgress.percentage}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {CATEGORIES.map((cat, index) => {
              const isCompleted = index < researchProgress.completed;
              const isCurrent = researchProgress.currentCategory === cat;
              
              return (
                <div 
                  key={cat}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : isCurrent 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
                        : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <span>
                    {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                  </span>
                  <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                </div>
              );
            })}
          </div>        </div>
      )}

      {researchResult && (
        <div className={`p-4 rounded-xl ${researchResult.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {researchResult.message}
        </div>
      )}

      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={categoryCounts}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
