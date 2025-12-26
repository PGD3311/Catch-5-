import { useCallback, useRef, useEffect, createContext, useContext, useState, ReactNode } from 'react';

type SoundType = 'cardPlay' | 'cardDeal' | 'trickWon' | 'bidMade' | 'bidSet' | 'victory' | 'defeat' | 'yourTurn' | 'buttonClick';

const STORAGE_KEY = 'catch5-sound-muted';

interface SoundContextValue {
  playSound: (type: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3,
    delay: number = 0
  ) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + duration);
    } catch (e) {
      // Audio context not available
    }
  }, [getAudioContext]);

  const playNoise = useCallback((duration: number, volume: number = 0.1) => {
    try {
      const ctx = getAudioContext();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.value = 800;

      source.buffer = buffer;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
    } catch (e) {
      // Audio context not available
    }
  }, [getAudioContext]);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted) return;

    switch (type) {
      case 'cardPlay':
        playNoise(0.05, 0.15);
        playTone(200, 0.03, 'square', 0.1);
        break;
      case 'cardDeal':
        playNoise(0.03, 0.08);
        break;
      case 'trickWon':
        playTone(523, 0.1, 'sine', 0.2, 0);
        playTone(659, 0.1, 'sine', 0.2, 0.08);
        playTone(784, 0.15, 'sine', 0.25, 0.16);
        break;
      case 'bidMade':
        playTone(523, 0.12, 'sine', 0.25, 0);
        playTone(659, 0.12, 'sine', 0.25, 0.1);
        playTone(784, 0.12, 'sine', 0.25, 0.2);
        playTone(1047, 0.25, 'sine', 0.3, 0.3);
        break;
      case 'bidSet':
        playTone(392, 0.15, 'sine', 0.2, 0);
        playTone(330, 0.15, 'sine', 0.2, 0.12);
        playTone(262, 0.3, 'sine', 0.25, 0.24);
        break;
      case 'victory':
        playTone(523, 0.1, 'sine', 0.25, 0);
        playTone(659, 0.1, 'sine', 0.25, 0.1);
        playTone(784, 0.1, 'sine', 0.25, 0.2);
        playTone(1047, 0.15, 'sine', 0.3, 0.3);
        playTone(784, 0.1, 'sine', 0.25, 0.45);
        playTone(1047, 0.3, 'sine', 0.35, 0.55);
        break;
      case 'defeat':
        playTone(392, 0.2, 'sine', 0.2, 0);
        playTone(330, 0.2, 'sine', 0.2, 0.2);
        playTone(262, 0.4, 'sine', 0.2, 0.4);
        break;
      case 'yourTurn':
        playTone(880, 0.08, 'sine', 0.15, 0);
        playTone(1047, 0.12, 'sine', 0.2, 0.1);
        break;
      case 'buttonClick':
        playTone(600, 0.02, 'square', 0.08);
        break;
    }
  }, [isMuted, playTone, playNoise]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const value = { playSound, isMuted, toggleMute };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}

export type { SoundType };
