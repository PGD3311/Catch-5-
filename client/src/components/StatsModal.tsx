import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Skull, Crown, TrendingDown } from "lucide-react";
import type { UserStats } from "@shared/schema";

interface LeaderboardEntry extends UserStats {
  playerName: string | null;
}

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function StatsModal({ open, onClose }: StatsModalProps) {
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/pin"],
    enabled: open,
    staleTime: 0,
  });

  const winners = leaderboard
    ?.filter(e => e.playerName && e.gamesPlayed > 0)
    .sort((a, b) => b.gamesWon - a.gamesWon) || [];

  const losers = leaderboard
    ?.filter(e => e.playerName && e.gamesPlayed > 0)
    .sort((a, b) => (b.gamesPlayed - b.gamesWon) - (a.gamesPlayed - a.gamesWon)) || [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Leaderboards</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="winners" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="winners" className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Winners
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex items-center gap-1.5">
              <Skull className="w-3.5 h-3.5" />
              Losers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="winners" className="mt-3">
            {isLoading ? (
              <LoadingSkeleton />
            ) : winners.length > 0 ? (
              <BoardList entries={winners} mode="winners" />
            ) : (
              <EmptyState />
            )}
          </TabsContent>
          <TabsContent value="losers" className="mt-3">
            {isLoading ? (
              <LoadingSkeleton />
            ) : losers.length > 0 ? (
              <BoardList entries={losers} mode="losers" />
            ) : (
              <EmptyState />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function BoardList({ entries, mode }: { entries: LeaderboardEntry[]; mode: "winners" | "losers" }) {
  return (
    <div className="space-y-1.5">
      {entries.map((entry, index) => {
        const losses = entry.gamesPlayed - entry.gamesWon;
        const winRate = entry.gamesPlayed > 0
          ? ((entry.gamesWon / entry.gamesPlayed) * 100).toFixed(0)
          : "0";
        const statValue = mode === "winners" ? entry.gamesWon : losses;

        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg ${
              index === 0
                ? mode === "winners"
                  ? "bg-amber-500/10 border border-amber-500/30"
                  : "bg-red-500/10 border border-red-500/30"
                : "bg-muted/40"
            }`}
          >
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              {index === 0 ? (
                mode === "winners" ? (
                  <Crown className="w-5 h-5 text-amber-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold capitalize truncate">
                {entry.playerName}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.gamesWon}W - {losses}L · {winRate}% · {entry.totalPointsScored} pts
              </p>
            </div>
            <div className={`text-lg font-bold tabular-nums ${
              mode === "winners" ? "text-amber-400" : "text-red-400"
            }`}>
              {statValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <p className="text-sm text-muted-foreground text-center py-6">
      No games played yet
    </p>
  );
}
