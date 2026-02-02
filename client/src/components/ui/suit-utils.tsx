import { cn } from '@/lib/utils';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import type { Suit } from '@shared/gameTypes';

export function getSuitColor(suit: Suit): string {
  switch (suit) {
    case 'Hearts':
      return 'text-red-500 dark:text-red-400';
    case 'Diamonds':
      return 'text-blue-500 dark:text-blue-400';
    case 'Clubs':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'Spades':
      return 'text-slate-800 dark:text-slate-100';
  }
}

export function SuitIcon({ suit, className }: { suit: Suit; className?: string }) {
  const iconClass = cn('drop-shadow-sm', className);
  switch (suit) {
    case 'Hearts':
      return <Heart className={iconClass} fill="currentColor" />;
    case 'Diamonds':
      return <Diamond className={iconClass} fill="currentColor" />;
    case 'Clubs':
      return <Club className={iconClass} fill="currentColor" />;
    case 'Spades':
      return <Spade className={iconClass} fill="currentColor" />;
  }
}
