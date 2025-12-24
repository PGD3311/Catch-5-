import { Player, DeckColor, Card as CardType, Team, Suit } from '@shared/gameTypes';
import { PlayingCard } from './PlayingCard';
import { CardDock } from './CardDock';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Bot, Crown, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerAreaProps {
  player: Player;
  team: Team;
  isCurrentPlayer: boolean;
  isBidder: boolean;
  isDealer: boolean;
  deckColor: DeckColor;
  onCardClick?: (card: CardType) => void;
  canPlayCard?: (card: CardType) => boolean;
  position: 'bottom' | 'top' | 'left' | 'right';
  showCards?: boolean;
  showBidResult?: boolean;
  trumpSuit?: Suit | null;
  onSortHand?: () => void;
}

export function PlayerArea({
  player,
  team,
  isCurrentPlayer,
  isBidder,
  isDealer,
  deckColor,
  onCardClick,
  canPlayCard,
  position,
  showCards = false,
  showBidResult = false,
  trumpSuit,
  onSortHand,
}: PlayerAreaProps) {
  const isBottom = position === 'bottom';
  const isTop = position === 'top';
  const isSide = position === 'left' || position === 'right';
  const isYourTeam = team.id === 'team1';
  
  // Team colors: Team 1 = Blue, Team 2 = Red/Orange
  const teamColorClasses = team.id === 'team1' 
    ? { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40', dot: 'bg-blue-500' }
    : { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40', dot: 'bg-orange-500' };

  const getContainerClasses = () => {
    const base = 'flex items-center gap-2';
    if (isBottom) return cn(base, 'flex-col');
    if (isTop) return cn(base, 'flex-col-reverse');
    if (position === 'left') return cn(base, 'flex-row');
    return cn(base, 'flex-row-reverse');
  };

  const getHandClasses = () => {
    if (isBottom) return 'flex justify-center items-end';
    if (isTop) return 'flex justify-center items-start';
    if (isSide) return 'flex flex-col items-center';
    return 'flex';
  };

  // Minimal chip for non-bottom players on mobile - Apple Wallet style
  const renderMinimalChip = () => (
    <div 
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'border backdrop-blur-sm transition-all',
        teamColorClasses.border,
        teamColorClasses.bg
      )}
      data-testid={`player-chip-${player.id}`}
    >
      {/* Team color dot */}
      <span className={cn('w-2 h-2 rounded-full', teamColorClasses.dot)} />
      <span className={cn(
        'text-[11px] font-medium',
        teamColorClasses.text
      )}>{player.name}</span>
      {isDealer && (
        <span className="px-1.5 py-0.5 text-[9px] text-amber-400 font-bold rounded-full border border-amber-400/60 bg-amber-500/10">D</span>
      )}
      {isBidder && <Crown className="w-2.5 h-2.5 text-amber-400" />}
      {showBidResult && player.bid !== null && (
        <span className={cn(
          'text-[10px] font-medium',
          player.bid > 0 ? 'text-amber-400' : 'text-muted-foreground/60'
        )}>
          {player.bid === 0 ? 'Pass' : player.bid}
        </span>
      )}
      {isCurrentPlayer && (
        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );

  // Full player info panel for desktop and bottom player
  const renderFullPanel = () => (
    <motion.div
      animate={isCurrentPlayer ? { 
        boxShadow: [
          '0 0 0 0 rgba(var(--primary-rgb), 0)',
          '0 0 16px 3px rgba(var(--primary-rgb), 0.3)',
          '0 0 0 0 rgba(var(--primary-rgb), 0)'
        ]
      } : {}}
      transition={isCurrentPlayer ? { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 rounded-xl',
        'backdrop-blur-sm border transition-all',
        isCurrentPlayer 
          ? 'bg-primary/10 border-primary/40' 
          : 'bg-card/50 border-border/30',
        isSide ? 'flex-col text-center' : 'flex-row'
      )}
    >
      {isDealer && (
        <div 
          className={cn(
            'absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full',
            'bg-amber-500 text-white flex items-center justify-center',
            'text-[9px] font-bold',
            'ring-2 ring-amber-400 ring-offset-1 ring-offset-background'
          )}
          title="Dealer"
          data-testid={`dealer-chip-${player.id}`}
        >
          D
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center',
          teamColorClasses.bg
        )}>
          {player.isHuman ? (
            <User className={cn('w-3 h-3', teamColorClasses.text)} />
          ) : (
            <Bot className={cn('w-3 h-3', teamColorClasses.text)} />
          )}
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className={cn('font-medium text-sm', teamColorClasses.text)}>{player.name}</span>
            {isBidder && (
              <Crown className="w-3 h-3 text-amber-400" />
            )}
          </div>
          <span className={cn(
            'text-[9px] font-medium uppercase tracking-wider',
            teamColorClasses.text, 'opacity-70'
          )}>
            {team.name}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 flex-wrap">
        {showBidResult && player.bid !== null && (
          <Badge 
            variant={player.bid > 0 ? 'outline' : 'secondary'} 
            className={cn(
              'text-[10px] px-1.5 py-0',
              player.bid > 0 && 'border-amber-500/40 text-amber-400'
            )}
            data-testid={`bid-result-${player.id}`}
          >
            {player.bid === 0 ? 'Pass' : `Bid ${player.bid}`}
          </Badge>
        )}
        {isBottom && showCards && onSortHand && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onSortHand}
            className="h-6 px-2 text-[10px]"
            data-testid="button-sort-hand"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Sort
          </Button>
        )}
      </div>
    </motion.div>
  );

  // Bottom player's cards with macOS Dock-style magnification
  const renderBottomCards = () => (
    <CardDock
      cards={player.hand}
      onCardClick={onCardClick}
      canPlayCard={canPlayCard}
      isCurrentPlayer={isCurrentPlayer}
      trumpSuit={trumpSuit}
    />
  );

  return (
    <div className={getContainerClasses()} data-testid={`player-area-${player.id}`}>
      {!isBottom ? (
        <>
          {/* Mobile: minimal chip */}
          <div className="block sm:hidden">{renderMinimalChip()}</div>
          {/* Desktop: full panel (no card backs - just the HUD) */}
          <div className="hidden sm:block">{renderFullPanel()}</div>
        </>
      ) : (
        <>
          {/* Compact identity line for bottom player */}
          <div className="flex items-center justify-center gap-3 w-full px-4">
            <div className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
              teamColorClasses.border, teamColorClasses.bg, 'border'
            )}>
              {/* Team color dot */}
              <span className={cn('w-2 h-2 rounded-full', teamColorClasses.dot)} />
              <span className={cn(
                'text-xs font-medium',
                teamColorClasses.text
              )}>{player.name}</span>
              {isDealer && (
                <span className="px-1.5 py-0.5 text-[9px] text-amber-400 font-bold rounded-full border border-amber-400/60 bg-amber-500/10">D</span>
              )}
              {isBidder && <Crown className="w-3 h-3 text-amber-400" />}
              {showBidResult && player.bid !== null && (
                <Badge 
                  variant={player.bid > 0 ? 'outline' : 'secondary'} 
                  className={cn(
                    'text-[9px] px-1.5 py-0 h-4',
                    player.bid > 0 && 'border-amber-500/40 text-amber-400'
                  )}
                >
                  {player.bid === 0 ? 'Pass' : player.bid}
                </Badge>
              )}
              {isCurrentPlayer && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            {onSortHand && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onSortHand}
                data-testid="button-sort-hand"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            )}
          </div>
          {showCards && renderBottomCards()}
        </>
      )}
    </div>
  );
}
