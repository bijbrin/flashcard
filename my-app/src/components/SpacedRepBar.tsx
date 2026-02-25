import { Category, CATEGORY_CONFIG } from '@/types';

interface SpacedRepBarProps {
  dueCounts: {
    '1d': number;
    '3d': number;
    '5d': number;
    '10d': number;
    '21d': number;
  };
}

export function SpacedRepBar({ dueCounts }: SpacedRepBarProps) {
  const intervals = [
    { key: '1d', label: '1d', color: 'bg-red-500' },
    { key: '3d', label: '3d', color: 'bg-orange-500' },
    { key: '5d', label: '5d', color: 'bg-yellow-500' },
    { key: '10d', label: '10d', color: 'bg-blue-500' },
    { key: '21d', label: '21d', color: 'bg-green-500' },
  ] as const;

  const total = Object.values(dueCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-300">Upcoming Reviews</h3>
        <span className="text-xs text-zinc-500">{total} total</span>
      </div>

      <div className="flex gap-1">
        {intervals.map((interval) => {
          const count = dueCounts[interval.key];
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div
              key={interval.key}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full bg-zinc-800 rounded-full h-24 relative overflow-hidden">
                <div
                  className={`absolute bottom-0 left-0 right-0 ${interval.color} transition-all duration-500 rounded-full`}
                  style={{ height: `${Math.max(percentage, 4)}%` }}
                />
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-zinc-400">{interval.label}</span>
                <span className="text-xs text-zinc-600 ml-1">({count})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
