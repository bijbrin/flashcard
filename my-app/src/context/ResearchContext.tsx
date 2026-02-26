'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface ResearchJob {
  jobId: string;
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
  startedAt: string;
}

interface ResearchContextType {
  activeJob: ResearchJob | null;
  isLoading: boolean;
  startResearch: () => Promise<void>;
  clearJob: () => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [activeJob, setActiveJob] = useState<ResearchJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Poll for job status
  useEffect(() => {
    if (!activeJob || activeJob.status !== 'running') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/research?jobId=${activeJob.jobId}`);
        if (response.ok) {
          const data = await response.json();
          setActiveJob(data);
        }
      } catch (e) {
        console.error('Failed to fetch job status:', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob?.jobId, activeJob?.status]);

  const startResearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mysimplecronsecret',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start research');
      }

      const data = await response.json();
      
      setActiveJob({
        jobId: data.jobId,
        status: 'running',
        progress: {
          categoryCompleted: 0,
          categoryTotal: 6,
          topicsFound: 0,
          flashcardsGenerated: 0,
          percentage: 0,
          status: 'Starting research...',
        },
        startedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to start research:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearJob = useCallback(() => {
    setActiveJob(null);
  }, []);

  return (
    <ResearchContext.Provider value={{ activeJob, isLoading, startResearch, clearJob }}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  const context = useContext(ResearchContext);
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
}