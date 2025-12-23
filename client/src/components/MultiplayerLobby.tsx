import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Check, Play, LogOut, Wifi, WifiOff, Bot, UserPlus } from 'lucide-react';
import type { DeckColor } from '@shared/gameTypes';

interface RoomPlayer {
  seatIndex: number;
  playerName: string;
  connected: boolean;
  isCpu?: boolean;
}

interface MultiplayerLobbyProps {
  connected: boolean;
  roomCode: string | null;
  seatIndex: number | null;
  players: RoomPlayer[];
  error: string | null;
  onCreateRoom: (playerName: string, deckColor: DeckColor, targetScore: number) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onClose: () => void;
  onAddCpu: (seatIndex: number) => void;
  onRemoveCpu: (seatIndex: number) => void;
  deckColor: DeckColor;
  targetScore: number;
}

export function MultiplayerLobby({
  connected,
  roomCode,
  seatIndex,
  players,
  error,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onLeaveRoom,
  onClose,
  onAddCpu,
  onRemoveCpu,
  deckColor,
  targetScore,
}: MultiplayerLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.trim(), deckColor, targetScore);
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && joinCode.trim()) {
      onJoinRoom(joinCode.trim().toUpperCase(), playerName.trim());
    }
  };

  const copyRoomCode = async () => {
    if (roomCode) {
      const url = `${window.location.origin}?room=${roomCode}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSeatLabel = (index: number) => {
    const labels = ['South (You)', 'West', 'North (Partner)', 'East'];
    return labels[index];
  };

  const getTeamLabel = (index: number) => {
    return index % 2 === 0 ? 'Team 1' : 'Team 2';
  };

  if (roomCode) {
    const isHost = seatIndex === 0;
    const allSeatsReady = players.length === 4;
    const humanCount = players.filter(p => !p.isCpu).length;
    const canStart = humanCount >= 1 && allSeatsReady;

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Game Lobby
            </CardTitle>
            <Badge variant="outline" className="text-sm font-mono">
              {roomCode}
            </Badge>
          </div>
          <CardDescription>
            Share the room code with friends to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={copyRoomCode}
            variant="outline"
            className="w-full"
            data-testid="button-copy-invite"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied Invite Link
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Invite Link
              </>
            )}
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Players ({players.length}/4)</p>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((seat) => {
                const player = players.find(p => p.seatIndex === seat);
                const isCurrentPlayer = seat === seatIndex;
                return (
                  <div
                    key={seat}
                    className={`p-3 rounded-md border ${
                      player
                        ? 'bg-muted/50 border-border'
                        : 'border-dashed border-muted-foreground/30'
                    } ${isCurrentPlayer ? 'ring-2 ring-primary' : ''}`}
                    data-testid={`seat-${seat}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {getSeatLabel(seat)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getTeamLabel(seat)}
                      </Badge>
                    </div>
                    {player ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {player.isCpu ? (
                            <Bot className="w-3 h-3 text-muted-foreground shrink-0" />
                          ) : player.connected ? (
                            <Wifi className="w-3 h-3 text-green-500 shrink-0" />
                          ) : (
                            <WifiOff className="w-3 h-3 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate">
                            {player.playerName}
                          </span>
                        </div>
                        {player.isCpu && isHost && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 shrink-0"
                            onClick={() => onRemoveCpu(seat)}
                            data-testid={`button-remove-cpu-${seat}`}
                          >
                            <LogOut className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ) : isHost ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full h-7 text-xs"
                        onClick={() => onAddCpu(seat)}
                        data-testid={`button-add-cpu-${seat}`}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Add CPU
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Waiting...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <div className="flex gap-2">
            {isHost && (
              <Button
                onClick={onStartGame}
                disabled={!canStart}
                className="flex-1"
                data-testid="button-start-online-game"
              >
                <Play className="w-4 h-4 mr-2" />
                {canStart ? 'Start Game' : `Fill ${4 - players.length} seats`}
              </Button>
            )}
            <Button
              onClick={onLeaveRoom}
              variant="outline"
              data-testid="button-leave-room"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {!allSeatsReady && isHost && (
            <p className="text-xs text-center text-muted-foreground">
              Add CPU players to fill empty seats, or wait for friends to join
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Online Multiplayer
        </CardTitle>
        <CardDescription>
          Play with friends over the internet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-md bg-muted">
            <WifiOff className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Connecting to server...</span>
          </div>
        )}

        {mode === 'menu' && connected && (
          <div className="space-y-3">
            <Button
              onClick={() => setMode('create')}
              className="w-full"
              data-testid="button-create-room"
            >
              Create New Room
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full"
              data-testid="button-join-room"
            >
              Join Existing Room
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
              data-testid="button-cancel-multiplayer"
            >
              Cancel
            </Button>
          </div>
        )}

        {mode === 'create' && connected && (
          <div className="space-y-3">
            <Input
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              data-testid="input-player-name-create"
            />
            <Button
              onClick={handleCreateRoom}
              disabled={!playerName.trim()}
              className="w-full"
              data-testid="button-confirm-create"
            >
              Create Room
            </Button>
            <Button
              onClick={() => setMode('menu')}
              variant="ghost"
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}

        {mode === 'join' && connected && (
          <div className="space-y-3">
            <Input
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              data-testid="input-player-name-join"
            />
            <Input
              placeholder="Room code (e.g., ABC123)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="font-mono text-center uppercase"
              maxLength={6}
              data-testid="input-room-code"
            />
            <Button
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || joinCode.length !== 6}
              className="w-full"
              data-testid="button-confirm-join"
            >
              Join Room
            </Button>
            <Button
              onClick={() => setMode('menu')}
              variant="ghost"
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
