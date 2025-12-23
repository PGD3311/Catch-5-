import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Check, Copy, Link2, Users, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  roomCode?: string | null;
}

export function ShareModal({ open, onClose, roomCode }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const isOnlineGame = !!roomCode;
  const gameUrl = typeof window !== 'undefined' 
    ? (roomCode ? `${window.location.origin}?room=${roomCode}` : window.location.href)
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: isOnlineGame 
          ? 'Share this link to invite players to your game.' 
          : 'Share this link with your friends to play together.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {isOnlineGame ? 'Invite Players' : 'Share with Friends'}
          </DialogTitle>
          <DialogDescription>
            {isOnlineGame 
              ? 'Send this link or room code to invite players!'
              : 'Send this link to invite friends to play Catch 5!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isOnlineGame && (
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/50">
              <Wifi className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Room Code:</span>
              <Badge variant="outline" className="text-lg font-mono px-3 py-1">
                {roomCode}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="share-link">{isOnlineGame ? 'Invite Link' : 'Game Link'}</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={gameUrl}
                readOnly
                className="flex-1 font-mono text-sm"
                data-testid="input-share-link"
              />
              <Button
                onClick={handleCopy}
                variant={copied ? 'default' : 'outline'}
                data-testid="button-copy-link"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link2 className="w-4 h-4" />
              How it works
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {isOnlineGame ? (
                <>
                  <li>Share the link or room code with friends</li>
                  <li>They can join from their own device</li>
                  <li>Once 4 players join, start the game!</li>
                  <li>Empty seats will be filled by CPU players</li>
                </>
              ) : (
                <>
                  <li>Share this link with up to 3 friends</li>
                  <li>Each person opens the link in their browser</li>
                  <li>Use Online Play to create a room</li>
                  <li>Play together from different devices</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <Button onClick={onClose} className="w-full" data-testid="button-close-share">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
