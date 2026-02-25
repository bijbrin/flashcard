import { Category, CATEGORY_CONFIG } from '@/types';

interface CategoryFilterProps {
  activeCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  counts?: Record<Category | 'all', number>;
}

export function CategoryFilter({ activeCategory, onCategoryChange, counts }: CategoryFilterProps) {
  const categories: (Category | 'all')[] = [
    'all',
    'react-hooks',
    'nextjs-core',
    'third-party-api',
    'server-side',
    'advanced',
    'ai-integration',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        const label = cat === 'all' ? 'All Topics' : CATEGORY_CONFIG[cat as Category].label;
        const count = counts?.[cat] ?? 0;

        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`ml-2 ${isActive ? 'text-zinc-600' : 'text-zinc-600'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
