'use client';

import { useState } from 'react';
import { TopicCard } from '@/components/TopicCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Category, Topic } from '@/types';

interface TopicsPageClientProps {
  initialTopics: Topic[];
}

export function TopicsPageClient({ initialTopics }: TopicsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const filteredTopics = activeCategory === 'all'
    ? initialTopics
    : initialTopics.filter(t => t.category === activeCategory);

  const categoryCounts = {
    all: initialTopics.length,
    'react-hooks': initialTopics.filter(t => t.category === 'react-hooks').length,
    'nextjs-core': initialTopics.filter(t => t.category === 'nextjs-core').length,
    'third-party-api': initialTopics.filter(t => t.category === 'third-party-api').length,
    'server-side': initialTopics.filter(t => t.category === 'server-side').length,
    'advanced': initialTopics.filter(t => t.category === 'advanced').length,
    'ai-integration': initialTopics.filter(t => t.category === 'ai-integration').length,
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
      </div>

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
