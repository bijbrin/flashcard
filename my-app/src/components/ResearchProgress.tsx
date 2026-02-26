'use client';

import { Sparkles, Loader2, CheckCircle, XCircle, BookOpen, Layers } from 'lucide-react';

interface ResearchProgressProps {
  job: {
    status: 'running' | 'completed' | 'error';
    progress: {
      currentCategory?: string;
      categoryCompleted: number;
      categoryTotal: number;
      topicsFound: number;
      flashcardsGenerated: number;
      percentage: number;
      status: string;
    };
    result?: {
      success: boolean;
      topicsAdded: number;
      flashcardsAdded: number;
      message: string;
    };
  };
  onDismiss?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  'react-hooks': 'React Hooks',
  'nextjs-core': 'Next.js Core',
  'third-party-api': 'Third-Party API',
  'server-side': 'Server-Side',
  'advanced': 'Advanced',
  'ai-integration': 'AI Integration',
};

export function ResearchProgress({ job, onDismiss }: ResearchProgressProps) {
  const { progress, result, status } = job;

  if (status === 'completed' || status === 'error') {
    return (
      <div className={`p-4 rounded-xl border ${
        status === 'completed' 
          ? 'bg-emerald-500/10 border-emerald-500/20' 
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        <div className="flex items-start gap-3">
          {status === 'completed' ? (
            <CheckCircle className="text-emerald-400 shrink-0" size={20} />
          ) : (
            <XCircle className="text-red-400 shrink-0" size={20} />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              status === 'completed' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {result?.message || (status === 'completed' ? 'Research complete!' : 'Research failed')}
            </p>
            {result && (
              <div className="flex gap-4 mt-2 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <BookOpen size={14} />
                  {result.topicsAdded} topics
                </span>
                <span className="flex items-center gap-1">
                  <Layers size={14} />
                  {result.flashcardsAdded} flashcards
                </span>
              </div>
            )}
          </div>
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Sparkles className="text-indigo-400" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100">Researching Topics</h3>
            <p className="text-sm text-zinc-400">{progress.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin text-indigo-400" size={18} />
          <span className="text-sm font-medium text-indigo-400">{progress.percentage}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-zinc-950/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Categories</p>
          <p className="text-lg font-semibold text-zinc-100">
            {progress.categoryCompleted} / {progress.categoryTotal}
          </p>
        </div>
        <div className="bg-zinc-950/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Topics Found</p>
          <p className="text-lg font-semibold text-emerald-400">{progress.topicsFound}</p>
        </div>
        <div className="bg-zinc-950/50 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">Flashcards</p>
          <p className="text-lg font-semibold text-cyan-400">{progress.flashcardsGenerated}</p>
        </div>
      </div>

      {/* Current category */}
      {progress.currentCategory && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Current:</span>
          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md font-medium">
            {CATEGORY_LABELS[progress.currentCategory] || progress.currentCategory}
          </span>
        </div>
      )}
    </div>
  );
}