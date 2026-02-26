'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { useResearch } from '@/context/ResearchContext';

export function ResearchButton() {
  const { startResearch, activeJob, isLoading } = useResearch();

  const handleClick = async () => {
    try {
      await startResearch();
    } catch (e: any) {
      console.error('Research failed:', e);
    }
  };

  const isResearching = activeJob?.status === 'running' || isLoading;

  return (
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
  );
}