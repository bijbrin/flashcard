import { Topic } from '@/types';
import { CATEGORY_CONFIG, DIFFICULTY_LABELS } from '@/types';
import { Clock, BookOpen } from 'lucide-react';

interface TopicCardProps {
  topic: Topic;
  isExplored?: boolean;
  isMastered?: boolean;
}

export function TopicCard({ topic, isExplored, isMastered }: TopicCardProps) {
  const config = CATEGORY_CONFIG[topic.category];
  const difficultyDots = Array(5).fill(0).map((_, i) => i < topic.difficulty);

  return (
    <a
      href={`/topics/${topic.slug}`}
      className={`block bg-zinc-900 border ${config.borderColor} rounded-xl p-6 transition-all hover:bg-zinc-800/50 hover:scale-[1.02] group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.borderColor.replace('border-', 'text-')}`}>
          {config.label}
        </div>
        <div className="flex gap-2">
          {isMastered && (
            <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400">
              Mastered
            </span>
          )}
          {isExplored && !isMastered && (
            <span className="px-2 py-1 bg-zinc-700/50 rounded-full text-xs text-zinc-400">
              Explored
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors">
        {topic.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
        {topic.plain_english_summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">{DIFFICULTY_LABELS[topic.difficulty]}</span>
          <div className="flex gap-0.5">
            {difficultyDots.map((filled, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  filled ? 'bg-zinc-400' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-zinc-500">
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            {topic.code_snippet ? 'Code' : 'Concept'}
          </span>
        </div>
      </div>
    </a>
  );
}
