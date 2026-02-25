import { SpacedRepBar } from "@/components/SpacedRepBar";
import { getStats, getDueFlashcards } from "@/lib/queries";
import { ArrowRight, Clock, Brain } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FlashcardsPage() {
  const stats = await getStats();
  const dueCards = await getDueFlashcards();
  
  const dueCounts = {
    '1d': dueCards.filter(c => (c.progress?.interval_days || 1) === 1).length,
    '3d': dueCards.filter(c => (c.progress?.interval_days || 1) === 3).length,
    '5d': dueCards.filter(c => (c.progress?.interval_days || 1) === 5).length,
    '10d': dueCards.filter(c => (c.progress?.interval_days || 1) === 10).length,
    '21d': dueCards.filter(c => (c.progress?.interval_days || 1) >= 21).length,
  };

  const totalCards = stats.totalTopics * 2; // Approximate
  const masteredCards = stats.masteredCards;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Flashcards</h1>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Spaced repetition helps you remember what you learn. 
          Review cards at optimal intervals for long-term retention.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <Clock size={24} className="text-rose-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-100">{stats.dueToday}</p>
          <p className="text-sm text-zinc-500">Due Today</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Brain size={24} className="text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-100">{totalCards}</p>
          <p className="text-sm text-zinc-500">Total Cards</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Brain size={24} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-100">{masteredCards}</p>
          <p className="text-sm text-zinc-500">Mastered</p>
        </div>
      </div>

      <SpacedRepBar dueCounts={dueCounts} />

      <div className="flex justify-center">
        <a
          href="/flashcards/review"
          className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors text-lg"
        >
          Start Review Session
          <ArrowRight size={20} />
        </a>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">How Spaced Repetition Works</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm font-medium">1d</div>
              <div>
                <p className="text-zinc-300 font-medium">First Review</p>
                <p className="text-sm text-zinc-500">Review new cards after 1 day</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-medium">3d</div>
              <div>
                <p className="text-zinc-300 font-medium">Second Review</p>
                <p className="text-sm text-zinc-500">If you remembered, wait 3 days</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-sm font-medium">5d</div>
              <div>
                <p className="text-zinc-300 font-medium">Third Review</p>
                <p className="text-sm text-zinc-500">Remember again? Wait 5 days</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">10d</div>
              <div>
                <p className="text-zinc-300 font-medium">Fourth Review</p>
                <p className="text-sm text-zinc-500">Interval increases to 10 days</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-medium">21d+</div>
              <div>
                <p className="text-zinc-300 font-medium">Mastery</p>
                <p className="text-sm text-zinc-500">21+ days means you've mastered it</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center text-sm font-medium">↻</div>
              <div>
                <p className="text-zinc-300 font-medium">Forgot?</p>
                <p className="text-sm text-zinc-500">Reset to 1 day and start over</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
