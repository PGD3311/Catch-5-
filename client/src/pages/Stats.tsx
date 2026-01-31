import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trophy, Target, TrendingUp, Award, Percent, Zap, Medal, LogOut, KeyRound } from "lucide-react";
import { Link } from "wouter";
import type { UserStats } from "@shared/schema";
import { PIN_CODES, getPlayerNameFromPin, isValidPin } from "@shared/pinCodes";

interface LeaderboardEntry extends UserStats {
  playerName: string | null;
}

const PIN_STORAGE_KEY = "catch5_pin";

export default function Stats() {
  const [pin, setPin] = useState("");
  const [enteredPin, setEnteredPin] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPin = localStorage.getItem(PIN_STORAGE_KEY);
    if (savedPin && isValidPin(savedPin)) {
      setEnteredPin(savedPin);
    }
  }, []);

  const playerName = enteredPin ? getPlayerNameFromPin(enteredPin) : null;

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats | null>({
    queryKey: ["/api/stats/pin", enteredPin],
    enabled: !!enteredPin,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/pin"],
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("Please enter a 4-digit code");
      return;
    }
    if (!isValidPin(pin)) {
      setError("Invalid code");
      return;
    }
    setEnteredPin(pin);
    localStorage.setItem(PIN_STORAGE_KEY, pin);
    setError("");
    setPin("");
  };

  const handleLogout = () => {
    setEnteredPin(null);
    localStorage.removeItem(PIN_STORAGE_KEY);
  };

  const winRate = stats && stats.gamesPlayed > 0 
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
    : "0.0";

  const bidSuccessRate = stats && stats.bidsMade > 0
    ? ((stats.bidsSucceeded / stats.bidsMade) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold" data-testid="text-stats-title">Player Statistics</h1>
        </div>

        {enteredPin && playerName && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {playerName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl capitalize" data-testid="text-user-name">
                    {playerName}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm" data-testid="text-user-code">Code: {enteredPin}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout-pin">
                <LogOut className="w-4 h-4 mr-2" />
                Switch Player
              </Button>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Trophy className="w-5 h-5 text-amber-500" />}
                    label="Games Won"
                    value={stats.gamesWon}
                    subtext={`${stats.gamesPlayed} played`}
                    testId="stat-games-won"
                  />
                  <StatCard
                    icon={<Percent className="w-5 h-5 text-blue-500" />}
                    label="Win Rate"
                    value={`${winRate}%`}
                    testId="stat-win-rate"
                  />
                  <StatCard
                    icon={<Target className="w-5 h-5 text-green-500" />}
                    label="Bid Success"
                    value={`${bidSuccessRate}%`}
                    subtext={`${stats.bidsSucceeded}/${stats.bidsMade}`}
                    testId="stat-bid-success"
                  />
                  <StatCard
                    icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
                    label="Total Points"
                    value={stats.totalPointsScored}
                    testId="stat-total-points"
                  />
                  <StatCard
                    icon={<Award className="w-5 h-5 text-amber-600" />}
                    label="Highest Bid Made"
                    value={stats.highestBidMade}
                    testId="stat-highest-bid"
                  />
                  <StatCard
                    icon={<Zap className="w-5 h-5 text-red-500" />}
                    label="Times Set"
                    value={stats.timesSet}
                    testId="stat-times-set"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8" data-testid="text-no-stats">
                  No stats yet. Play some games to see your statistics!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {!enteredPin && (
          <Card className="mb-6">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4">
                <KeyRound className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center" data-testid="text-pin-prompt">
                  Enter your 4-digit code to view your stats
                </p>
                <form onSubmit={handlePinSubmit} className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="0000"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                      setError("");
                    }}
                    className="w-24 text-center text-lg tracking-widest"
                    data-testid="input-pin"
                  />
                  <Button type="submit" data-testid="button-submit-pin">
                    View Stats
                  </Button>
                </form>
                {error && (
                  <p className="text-destructive text-sm" data-testid="text-pin-error">{error}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    data-testid={`leaderboard-entry-${index}`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {index === 0 ? (
                        <Medal className="w-6 h-6 text-amber-500" />
                      ) : index === 1 ? (
                        <Medal className="w-6 h-6 text-slate-400" />
                      ) : index === 2 ? (
                        <Medal className="w-6 h-6 text-amber-700" />
                      ) : (
                        <span className="text-muted-foreground font-medium">{index + 1}</span>
                      )}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20">
                        {entry.playerName?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium capitalize" data-testid={`leaderboard-name-${index}`}>
                        {entry.playerName || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`leaderboard-games-${index}`}>
                        {entry.gamesPlayed} games played
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-sm" data-testid={`leaderboard-wins-${index}`}>
                      {entry.gamesWon} wins
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8" data-testid="text-empty-leaderboard">
                No players on the leaderboard yet. Be the first!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subtext,
  testId
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  subtext?: string;
  testId?: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 text-center" data-testid={testId}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold" data-testid={testId ? `${testId}-value` : undefined}>{value}</p>
      <p className="text-xs text-muted-foreground" data-testid={testId ? `${testId}-label` : undefined}>{label}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}
