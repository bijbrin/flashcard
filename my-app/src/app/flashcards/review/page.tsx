'use client';

import { useState, useEffect } from 'react';
import { FlashCard } from '@/components/FlashCard';
import { FlashcardWithProgress } from '@/types';
import { calculateNextReview, getNextReviewDate, getInitialSM2State } from '@/lib/sm2';
import { CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ReviewPage() {
  const [cards, setCards] = useState<FlashcardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flashcards?due=today')
      .then(r => r.json())
      .then(data => {
        setCards(data.cards || []);
        setLoading(false);
      });
  }, []);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  const handleRate = async (quality: number) => {
    if (!currentCard) return;

    // Update card progress with SM-2
    const currentState = currentCard.progress ? {
      repetition: currentCard.progress.repetition,
      interval: currentCard.progress.interval_days,
      easinessFactor: currentCard.progress.easiness_factor,
    } : getInitialSM2State();

    const newState = calculateNextReview(currentState, quality);

    // Save to server
    await fetch(`/api/flashcards/${currentCard.id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quality,
        repetition: newState.repetition,
        intervalDays: newState.interval,
        easinessFactor: newState.easinessFactor,
      }),
    });

    // Update streak
    if (quality >= 3) {
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setSessionComplete(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-zinc-400">Loading flashcards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-zinc-100">All Caught Up! 🎉</h1>
        
        <p className="text-zinc-400">No cards due for review today. Check back tomorrow!</p>

        <div className="flex justify-center gap-4">
          <a
            href="/flashcards"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-xl transition-colors"
          >
            Back to Flashcards
          </a>
          <a
            href="/topics"
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
          >
            Browse Topics
          </a>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const correctCards = cards.filter(c => {
      const lastQuality = c.progress?.quality_history?.slice(-1)[0];
      return (lastQuality ?? 0) >= 3;
    }).length;

    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-zinc-100">Session Complete! 🎉</h1>
        
        <p className="text-zinc-400">
          You reviewed {cards.length} cards.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-zinc-100">{cards.length}</p>
              <p className="text-sm text-zinc-500">Cards Reviewed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{streak}</p>
              <p className="text-sm text-zinc-500">Best Streak</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <a
            href="/flashcards"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium rounded-xl transition-colors"
          >
            Back to Flashcards
          </a>
          <a
            href="/"
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Card {currentIndex + 1} of {cards.length}</span>
          <span className="text-zinc-500">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentCard && (
        <FlashCard
          card={currentCard}
          onRate={handleRate}
          streak={streak}
        />
      )}
    </div>
  );
}
