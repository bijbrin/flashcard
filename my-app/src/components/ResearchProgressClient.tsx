'use client';

import { ResearchProgress } from "@/components/ResearchProgress";
import { useResearch } from "@/context/ResearchContext";

export function ResearchProgressClient() {
  const { activeJob, clearJob } = useResearch();
  
  if (!activeJob) return null;
  
  return (
    <ResearchProgress 
      job={activeJob} 
      onDismiss={activeJob.status !== 'running' ? clearJob : undefined}
    />
  );
}