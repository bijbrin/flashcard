'use client';

import { useState } from 'react';
import { TopicCard } from '@/components/TopicCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Category, Topic } from '@/types';
import { Sparkles, Loader2 } from 'lucide-react';

interface TopicsPageClientProps {
  initialTopics: Topic[];
}

export function TopicsPageClient({ initialTopics }: TopicsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [isResearching, setIsResearching] = useState(false);
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
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-secret',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResearchResult({
          success: true,
          message: `Added ${data.topics_added} new topics! Refresh to see them.`,
        });
        // Refresh topics after a delay
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResearchResult({
          success: false,
          message: data.error || 'Research failed',
        });
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
