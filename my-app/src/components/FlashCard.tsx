'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FlashcardWithProgress } from '@/types';
import { CodeBlock } from './CodeBlock';

interface FlashCardProps {
  card: FlashcardWithProgress;
  onRate: (quality: number) => void;
  streak?: number;
}

const RATING_BUTTONS = [
  { quality: 0, label: 'Again', emoji: '😰', color: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30' },
  { quality: 2, label: 'Hard', emoji: '😐', color: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/30' },
  { quality: 4, label: 'Good', emoji: '🙂', color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30' },
  { quality: 5, label: 'Easy', emoji: '🔥', color: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30' },
];

export function FlashCard({ card, onRate, streak = 0 }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (quality: number) => {
    onRate(quality);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Streak indicator */}
      {streak > 0 && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <span className="text-amber-400">🔥</span>
            <span className="text-amber-400 text-sm font-medium">
              {streak} card{streak !== 1 ? 's' : ''} in a row!
            </span>
          </div>
        </div>
      )}

      {/* Card container */}
      <div className="relative h-[400px] perspective-1000 cursor-pointer" onClick={handleFlip}>
        <motion.div
          className="relative w-full h-full transform-style-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Front of card */}
          <div className="absolute inset-0 backface-hidden">
            <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Question
                </span>
                <span className="text-xs text-zinc-600">
                  Click to flip
                </span>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl text-zinc-100 text-center leading-relaxed">
                  {card.card_front}
                </p>
              </div>

              {card.has_code_snippet && card.code_snippet && (
                <div className="mt-6 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                  <p className="text-xs text-zinc-600 mb-2">Code hint (blurred)</p>
                  <div className="blur-sm opacity-50">
                    <CodeBlock code={card.code_snippet.slice(0, 100) + '...'} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Answer
                </span>
              </div>
              
              <div className="flex-1">
                <p className="text-lg text-zinc-100 leading-relaxed mb-6">
                  {card.card_back}
                </p>

                {card.has_code_snippet && card.code_snippet && (
                  <div className="mb-6">
                    <CodeBlock code={card.code_snippet} />
                  </div>
                )}

                {card.memory_hook && (
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <p className="text-xs text-indigo-400 font-medium mb-1">💡 Memory Hook</p>
                    <p className="text-sm text-indigo-300">{card.memory_hook}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating buttons */}
      <div className="flex justify-center gap-3 mt-6">
        {RATING_BUTTONS.map((button) => (
          <button
            key={button.quality}
            onClick={(e) => {
              e.stopPropagation();
              handleRate(button.quality);
            }}
            className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${button.color}`}
          >
            <span className="text-xl">{button.emoji}</span>
            <span className="text-xs font-medium">{button.label}</span>
          </button>
        ))}
      </div>

      <p className="text-center text-zinc-600 text-sm mt-4">
        Rate how well you knew this
      </p>
    </div>
  );
}
