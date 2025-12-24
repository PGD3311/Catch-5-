import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, ThumbsUp, ThumbsDown, Laugh, Angry, Heart, Flame, HandMetal, Brain } from 'lucide-react';
import type { ChatMessage, QuickEmojiId } from '@shared/gameTypes';
import { QUICK_EMOJIS } from '@shared/gameTypes';

const EMOJI_ICONS: Record<string, typeof ThumbsUp> = {
  ThumbsUp,
  ThumbsDown,
  Laugh,
  Angry,
  Heart,
  Flame,
  HandMetal,
  Brain,
};

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, type: 'text' | 'emoji') => void;
  currentPlayerId: string;
  isOpen: boolean;
  onToggle: () => void;
  unreadCount: number;
}

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  currentPlayerId, 
  isOpen, 
  onToggle,
  unreadCount 
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendText = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim(), 'text');
      setInputValue('');
    }
  };

  const handleSendEmoji = (emojiId: QuickEmojiId) => {
    onSendMessage(emojiId, 'emoji');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const getEmojiIcon = (emojiId: string) => {
    const emoji = QUICK_EMOJIS.find(e => e.id === emojiId);
    if (emoji) {
      const IconComponent = EMOJI_ICONS[emoji.icon];
      if (IconComponent) {
        return <IconComponent className="w-6 h-6" />;
      }
    }
    return <span className="text-lg">{emojiId}</span>;
  };

  if (!isOpen) {
    return (
      <Button
        size="icon"
        variant="outline"
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        data-testid="button-open-chat"
      >
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-card border rounded-lg shadow-xl flex flex-col" style={{ maxHeight: '400px' }}>
      <div className="flex items-center justify-between gap-2 p-3 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Chat</span>
        </div>
        <Button size="icon" variant="ghost" onClick={onToggle} data-testid="button-close-chat">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3" style={{ minHeight: '200px', maxHeight: '250px' }}>
        <div ref={scrollRef} className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">No messages yet</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentPlayerId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  data-testid={`chat-message-${msg.id}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                    )}
                    {msg.type === 'emoji' ? (
                      <div className="flex items-center justify-center py-1">
                        {getEmojiIcon(msg.content)}
                      </div>
                    ) : (
                      <p className="text-sm break-words">{msg.content}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t space-y-2">
        <div className="flex gap-1 justify-center flex-wrap">
          {QUICK_EMOJIS.map((emoji) => {
            const IconComponent = EMOJI_ICONS[emoji.icon];
            return (
              <Button
                key={emoji.id}
                size="icon"
                variant="ghost"
                className="w-8 h-8"
                onClick={() => handleSendEmoji(emoji.id)}
                title={emoji.label}
                data-testid={`button-emoji-${emoji.id}`}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
              </Button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={200}
            data-testid="input-chat-message"
          />
          <Button size="icon" onClick={handleSendText} disabled={!inputValue.trim()} data-testid="button-send-chat">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FloatingEmojiProps {
  emoji: ChatMessage;
  senderPosition: 'left' | 'right' | 'top' | 'bottom';
}

export function FloatingEmoji({ emoji, senderPosition }: FloatingEmojiProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const emojiDef = QUICK_EMOJIS.find(e => e.id === emoji.content);
  const IconComponent = emojiDef ? EMOJI_ICONS[emojiDef.icon] : null;

  const positionClasses: Record<string, string> = {
    left: 'left-16 top-1/2 -translate-y-1/2',
    right: 'right-16 top-1/2 -translate-y-1/2',
    top: 'top-16 left-1/2 -translate-x-1/2',
    bottom: 'bottom-16 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`absolute ${positionClasses[senderPosition]} z-40 animate-bounce`}
      style={{ animationDuration: '0.5s' }}
    >
      <div className="bg-card/90 backdrop-blur-sm rounded-full p-3 shadow-lg border">
        {IconComponent ? (
          <IconComponent className="w-8 h-8 text-primary" />
        ) : (
          <span className="text-2xl">{emoji.content}</span>
        )}
      </div>
    </div>
  );
}
