'use client';

import { ResearchProgress } from "@/components/ResearchProgress";
import { useResearchProgress } from "@/hooks/useResearchProgress";

export function ResearchProgressClient() {
  const { activeJob, clearJob } = useResearchProgress();
  
  if (!activeJob) return null;
  
  return (
    <ResearchProgress 
      job={activeJob} 
      onDismiss={activeJob.status !== 'running' ? clearJob : undefined}
    />
  );
}