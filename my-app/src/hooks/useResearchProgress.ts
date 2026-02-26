'use client';

import { useState, useEffect, useCallback } from 'react';

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

export function useResearchProgress() {
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
          
          // Stop polling if job is complete or errored
          if (data.status === 'completed' || data.status === 'error') {
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error('Failed to fetch job status:', e);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [activeJob?.jobId, activeJob?.status]);

  // Start research
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
      
      // Set initial job state
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

      return data.jobId;
    } catch (error) {
      console.error('Failed to start research:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear completed job
  const clearJob = useCallback(() => {
    setActiveJob(null);
  }, []);

  return {
    activeJob,
    isLoading,
    startResearch,
    clearJob,
  };
}