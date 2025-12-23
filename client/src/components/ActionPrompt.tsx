import { GameState, Player } from '@shared/gameTypes';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ActionPromptProps {
  gameState: GameState;
}

export function ActionPrompt({ gameState }: ActionPromptProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const dealer = gameState.players[gameState.dealerIndex];
  const bidder = gameState.players.find(p => p.id === gameState.bidderId);
  
  const getMessage = (): { text: string; isWaiting: boolean } => {
    switch (gameState.phase) {
      case 'bidding':
        if (currentPlayer.isHuman) {
          return { text: `Your turn to bid! (${gameState.highBid > 0 ? `beat ${gameState.highBid}` : 'bid 5-9 or pass'})`, isWaiting: false };
        }
        return { text: `Waiting for ${currentPlayer.name} to bid...`, isWaiting: true };
      
      case 'trump-selection':
        return { text: 'You won the bid! Select the trump suit.', isWaiting: false };
      
      case 'playing':
        if (currentPlayer.isHuman) {
          if (gameState.currentTrick.length === 0) {
            return { text: 'Your lead! Play any card.', isWaiting: false };
          }
          return { text: 'Your turn to play a card.', isWaiting: false };
        }
        return { text: `Waiting for ${currentPlayer.name} to play...`, isWaiting: true };
      
      default:
        return { text: '', isWaiting: false };
    }
  };

  const { text, isWaiting } = getMessage();

  if (!text) return null;

  return (
    <div 
      className={cn(
        'flex items-center justify-center gap-3 px-6 py-3 rounded-lg',
        'bg-primary/10 border border-primary/20',
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-300'
      )}
      data-testid="action-prompt"
    >
      {isWaiting && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

interface BidAnnouncementProps {
  player: Player;
  bid: number | null;
  isDealer: boolean;
}

export function BidAnnouncement({ player, bid, isDealer }: BidAnnouncementProps) {
  if (bid === null) return null;
  
  const message = bid === 0 ? 'Pass' : `Bid ${bid}`;
  
  return (
    <Badge 
      variant={bid > 0 ? 'default' : 'secondary'}
      className="text-xs"
      data-testid={`bid-announcement-${player.id}`}
    >
      {message}
    </Badge>
  );
}
