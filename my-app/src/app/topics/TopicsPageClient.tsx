'use client';

import { useState } from 'react';
import { TopicCard } from '@/components/TopicCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ResearchProgress } from '@/components/ResearchProgress';
import { ResearchButton } from '@/components/ResearchButton';
import { Category, Topic } from '@/types';
import { useResearchProgress } from '@/hooks/useResearchProgress';

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
  const { activeJob, clearJob } = useResearchProgress();

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

  // Refresh topics when research completes
  const handleDismiss = () => {
    clearJob();
    // Reload page to get new topics
    window.location.reload();
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
        
        <ResearchButton />
      </div>

      {/* Research Progress */}
      {activeJob && (
        <ResearchProgress 
          job={activeJob} 
          onDismiss={activeJob.status !== 'running' ? handleDismiss : undefined}
        />
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