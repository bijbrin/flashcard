import { ProgressRing } from "@/components/ProgressRing";
import { SpacedRepBar } from "@/components/SpacedRepBar";
import { ResearchProgressClient } from "@/components/ResearchProgressClient";
import { ResearchButton } from "@/components/ResearchButton";
import { CATEGORY_CONFIG, Category } from "@/types";
import { getStats, getDueFlashcards } from "@/lib/queries";
import { initDatabase } from "@/lib/init-db";
import { ArrowRight, BookOpen, Flame, Target } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Initialize database tables on first load
  await initDatabase();
  
  let stats = { totalTopics: 6, masteredCards: 0, dueToday: 0 };
  let dueCards: any[] = [];
  
  try {
    stats = await getStats();
    dueCards = await getDueFlashcards();
  } catch (e) {
    // DB not available during build
  }
  
  // Calculate due counts by interval
  const dueCounts = {
    '1d': dueCards.filter(c => (c.progress?.interval_days || 1) === 1).length || 8,
    '3d': dueCards.filter(c => (c.progress?.interval_days || 1) === 3).length || 12,
    '5d': dueCards.filter(c => (c.progress?.interval_days || 1) === 5).length || 5,
    '10d': dueCards.filter(c => (c.progress?.interval_days || 1) === 10).length || 3,
    '21d': dueCards.filter(c => (c.progress?.interval_days || 1) >= 21).length || 2,
  };

  // Calculate category progress (mock for now - would be based on actual user progress)
  const categoryProgress: Record<Category, number> = {
    'react-hooks': 25,
    'nextjs-core': 40,
    'third-party-api': 15,
    'server-side': 30,
    'advanced': 10,
    'ai-integration': 5,
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">
              Welcome back, developer
            </h1>
            <p className="text-zinc-400">
              {stats.masteredCards} topics mastered · {stats.dueToday} due today · 5 day streak
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <ResearchButton />
            <a
              href="/flashcards/review"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              <Target size={18} />
              Start Today's Review
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <BookOpen size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{stats.masteredCards}</p>
                <p className="text-xs text-zinc-500">Mastered</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Flame size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">5</p>
                <p className="text-xs text-zinc-500">Day Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <Target size={20} className="text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{stats.dueToday}</p>
                <p className="text-xs text-zinc-500">Due Today</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{stats.totalTopics}</p>
                <p className="text-xs text-zinc-500">Total Topics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Progress - Client Component */}
      <ResearchProgressClient />

      {/* Progress Rings */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Category Progress</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
            <div key={cat} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center">
              <ProgressRing
                progress={categoryProgress[cat]}
                size={70}
                color={CATEGORY_CONFIG[cat].color}
              />
              <span className="text-xs text-zinc-500 text-center mt-2">
                {CATEGORY_CONFIG[cat].label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spaced Repetition Bar */}
      <SpacedRepBar dueCounts={dueCounts} />
    </div>
  );
}