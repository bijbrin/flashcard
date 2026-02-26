'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useResearchProgress } from '@/hooks/useResearchProgress';

export function ResearchButton() {
  const { startResearch, activeJob, isLoading } = useResearchProgress();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    try {
      await startResearch();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const isResearching = activeJob?.status === 'running' || isLoading;

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isResearching}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 text-zinc-100 font-medium rounded-xl transition-colors border border-zinc-700"
      >
        {isResearching ? (
          <>
            <Loader2 size={18} className="animate-spin text-indigo-400" />
            <span className="text-zinc-400">Researching...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} className="text-amber-400" />
            Research Topics
          </>
        )}
      </button>
      
      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </>
  );
}