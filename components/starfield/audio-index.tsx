'use client';

import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type BaseTrack = {
  id: string;
  title: string;
  code: string;
  accent: string;
  gain: number;
};

type ProceduralTrack = BaseTrack & {
  kind: 'procedural';
  stepSeconds: number;
  chords: number[][];
  bellNotes: number[];
  padWave: OscillatorType;
  bellWave: OscillatorType;
};

type FileTrack = BaseTrack & {
  kind: 'file';
  src: string;
};

type Track = FileTrack | ProceduralTrack;

type AudioNodeRecord = {
  stopAt: number;
  nodes: Array<OscillatorNode | AudioBufferSourceNode>;
};

type HoshikuzuWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

const DEFAULT_MASTER_VOLUME = 0.22;
const MAX_MASTER_VOLUME = 0.6;
const FADE_OUT_MS = 680;
const FADE_IN_MS = 1100;

const TRACKS: Track[] = [
  {
    id: 'crystal-ambient-piano',
    title: 'crystal ambient piano',
    code: 'audio 01',
    kind: 'file',
    src: '/assets/music/silentvoice-crystal-ambient-piano-252638.mp3',
    accent: '#d6eef1',
    gain: 0.34,
  },
  {
    id: 'faint-orbit',
    title: 'faint orbit',
    code: 'audio 02',
    kind: 'procedural',
    stepSeconds: 2.8,
    chords: [
      [261.63, 329.63, 392.0],
      [293.66, 349.23, 440.0],
      [246.94, 329.63, 392.0],
      [220.0, 293.66, 369.99],
    ],
    bellNotes: [659.25, 587.33, 783.99, 523.25],
    padWave: 'sine',
    bellWave: 'triangle',
    accent: '#aad7dc',
    gain: 2.45,
  },
  {
    id: 'ethereal-night-loop',
    title: 'ethereal night loop',
    code: 'audio 03',
    kind: 'file',
    src: '/assets/music/perry767-ethereal-night-loop-274337.mp3',
    accent: '#f5f0dc',
    gain: 0.26,
  },
  {
    id: 'archive-dust',
    title: 'archive dust',
    code: 'audio 04',
    kind: 'procedural',
    stepSeconds: 3.2,
    chords: [
      [196.0, 246.94, 329.63],
      [220.0, 261.63, 392.0],
      [174.61, 261.63, 349.23],
      [185.0, 233.08, 293.66],
    ],
    bellNotes: [523.25, 440.0, 587.33, 493.88],
    padWave: 'sine',
    bellWave: 'sine',
    accent: '#f5f0dc',
    gain: 2.7,
  },
  {
    id: 'night-signal',
    title: 'night signal',
    code: 'audio 05',
    kind: 'procedural',
    stepSeconds: 2.55,
    chords: [
      [233.08, 293.66, 369.99],
      [261.63, 311.13, 415.3],
      [207.65, 261.63, 349.23],
      [246.94, 329.63, 440.0],
    ],
    bellNotes: [622.25, 739.99, 554.37, 830.61],
    padWave: 'triangle',
    bellWave: 'sine',
    accent: '#c7d9ef',
    gain: 2.55,
  },
];

function makeNoiseBuffer(context: AudioContext) {
  const duration = 2;
  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, duration * sampleRate, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.26;
  }

  return buffer;
}

function ramp(gain: AudioParam, start: number, peak: number, end: number, value: number) {
  gain.cancelScheduledValues(start);
  gain.setValueAtTime(0.0001, start);
  gain.exponentialRampToValueAtTime(value, peak);
  gain.exponentialRampToValueAtTime(0.0001, end);
}

export default function AudioIndex({ isArchive }: { isArchive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [masterVolume, setMasterVolume] = useState(DEFAULT_MASTER_VOLUME);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const fileFadeFrameRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef(0);
  const stepRef = useRef(0);
  const trackIndexRef = useRef(0);
  const nodesRef = useRef<AudioNodeRecord[]>([]);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const didAutoStartRef = useRef(false);
  const startFromRef = useRef<(
    index: number,
    options?: { resume?: boolean; fadeOut?: boolean },
  ) => void>(() => undefined);

  const currentTrack = TRACKS[activeIndex];
  const masterPercent = Math.round(masterVolume * 100);

  const getEffectiveVolume = useCallback((track: Track, muted = isMuted) => {
    if (muted) return 0;
    return Math.min(1, masterVolume * track.gain);
  }, [isMuted, masterVolume]);

  const clearScheduler = useCallback(() => {
    if (schedulerRef.current !== null) {
      window.clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
  }, []);

  const clearTransition = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  const trimNodes = useCallback((time: number) => {
    nodesRef.current = nodesRef.current.filter((record) => {
      if (record.stopAt > time) return true;
      return false;
    });
  }, []);

  const stopNodes = useCallback(() => {
    const context = contextRef.current;
    const now = context?.currentTime ?? 0;
    nodesRef.current.forEach((record) => {
      record.nodes.forEach((node) => {
        try {
          node.stop(now + 0.04);
        } catch {
          // The node may already be stopped by its own envelope.
        }
      });
    });
    nodesRef.current = [];
  }, []);

  const ensureContext = useCallback(() => {
    if (contextRef.current && masterGainRef.current) {
      return contextRef.current;
    }

    const AudioContextConstructor = window.AudioContext
      ?? (window as HoshikuzuWindow).webkitAudioContext;
    const context = new AudioContextConstructor();
    const masterGain = context.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);

    contextRef.current = context;
    masterGainRef.current = masterGain;
    noiseBufferRef.current = makeNoiseBuffer(context);
    return context;
  }, []);

  const schedulePad = useCallback((track: ProceduralTrack, step: number, time: number) => {
    const context = contextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain) return;

    const chord = track.chords[step % track.chords.length];
    const stopAt = time + track.stepSeconds * 2.45;
    const nodes: OscillatorNode[] = [];

    chord.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();

      oscillator.type = track.padWave;
      oscillator.frequency.setValueAtTime(frequency / 2, time);
      oscillator.detune.setValueAtTime((index - 1) * 3.5, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(920, time);
      filter.Q.setValueAtTime(0.46, time);
      ramp(gain.gain, time, time + 1.2, stopAt, 0.018);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      oscillator.start(time);
      oscillator.stop(stopAt + 0.08);
      nodes.push(oscillator);
    });

    nodesRef.current.push({ stopAt, nodes });
  }, []);

  const scheduleBell = useCallback((track: ProceduralTrack, step: number, time: number) => {
    const context = contextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain || step % 2 !== 1) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const frequency = track.bellNotes[step % track.bellNotes.length];
    const start = time + 0.18;
    const stopAt = start + 2.2;

    oscillator.type = track.bellWave;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.setValueAtTime(step % 4 === 1 ? -4 : 5, start);
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(360, start);
    ramp(gain.gain, start, start + 0.04, stopAt, 0.026);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(stopAt + 0.08);
    nodesRef.current.push({ stopAt, nodes: [oscillator] });
  }, []);

  const scheduleDust = useCallback((time: number) => {
    const context = contextRef.current;
    const masterGain = masterGainRef.current;
    const noiseBuffer = noiseBufferRef.current;
    if (!context || !masterGain || !noiseBuffer) return;

    const source = context.createBufferSource();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const stopAt = time + 1.9;

    source.buffer = noiseBuffer;
    source.playbackRate.setValueAtTime(0.42, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(620, time);
    ramp(gain.gain, time, time + 0.5, stopAt, 0.006);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start(time);
    source.stop(stopAt + 0.04);
    nodesRef.current.push({ stopAt, nodes: [source] });
  }, []);

  const scheduleStep = useCallback((time: number) => {
    const track = TRACKS[trackIndexRef.current];
    if (track.kind !== 'procedural') return;

    const step = stepRef.current;

    schedulePad(track, step, time);
    scheduleBell(track, step, time);
    if (step % 4 === 0) scheduleDust(time + 0.36);

    stepRef.current += 1;
    if (stepRef.current >= track.chords.length * 2) {
      const nextIndex = (trackIndexRef.current + 1) % TRACKS.length;
      stepRef.current = 0;
      window.setTimeout(() => startFromRef.current(nextIndex), 0);
    }
  }, [scheduleBell, scheduleDust, schedulePad]);

  const fadeFileVolume = useCallback((targetVolume: number, durationMs: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fileFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(fileFadeFrameRef.current);
      fileFadeFrameRef.current = null;
    }

    if (durationMs <= 0) {
      audio.volume = targetVolume;
      return;
    }

    const startVolume = audio.volume;
    const startedAt = window.performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - (1 - progress) ** 4;
      audio.volume = startVolume + (targetVolume - startVolume) * eased;

      if (progress < 1) {
        fileFadeFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      fileFadeFrameRef.current = null;
    };

    fileFadeFrameRef.current = window.requestAnimationFrame(tick);
  }, []);

  const fadeProceduralVolume = useCallback((targetVolume: number, durationMs: number) => {
    const context = contextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain) return;

    const now = context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);

    if (durationMs <= 0) {
      masterGain.gain.setValueAtTime(targetVolume, now);
      return;
    }

    masterGain.gain.linearRampToValueAtTime(targetVolume, now + durationMs / 1000);
  }, []);

  const fadeCurrentOutput = useCallback((targetVolume: number, durationMs: number) => {
    const track = TRACKS[trackIndexRef.current];

    if (track.kind === 'file') {
      fadeFileVolume(targetVolume, durationMs);
      return;
    }

    fadeProceduralVolume(targetVolume, durationMs);
  }, [fadeFileVolume, fadeProceduralVolume]);

  const stopFile = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fileFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(fileFadeFrameRef.current);
      fileFadeFrameRef.current = null;
    }

    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }, []);

  const playFile = useCallback((track: FileTrack, fadeIn: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.src;
    audio.currentTime = 0;
    audio.loop = false;
    audio.muted = isMuted;
    audio.volume = fadeIn ? 0 : getEffectiveVolume(track);
    void audio.play().catch(() => undefined);
    fadeFileVolume(getEffectiveVolume(track), fadeIn ? FADE_IN_MS : 0);
  }, [fadeFileVolume, getEffectiveVolume, isMuted]);

  const startFrom = useCallback((index: number, options: { resume?: boolean; fadeOut?: boolean } = {}) => {
    const track = TRACKS[index];
    const shouldFadeOut = options.fadeOut ?? isPlaying;

    clearTransition();

    const beginTrack = () => {
      clearScheduler();
      stopNodes();
      stopFile();
      trackIndexRef.current = index;
      stepRef.current = 0;
      setActiveIndex(index);
      setIsPlaying(true);

      if (track.kind === 'file') {
        playFile(track, true);
        return;
      }

      const context = ensureContext();

      if (options.resume !== false && context.state === 'suspended') {
        void context.resume().catch(() => undefined);
      }

      fadeProceduralVolume(0, 0);
      nextStepTimeRef.current = context.currentTime + 0.08;
      fadeProceduralVolume(getEffectiveVolume(track), FADE_IN_MS);

      schedulerRef.current = window.setInterval(() => {
        const audioContext = contextRef.current;
        if (!audioContext) return;

        while (nextStepTimeRef.current < audioContext.currentTime + 0.42) {
          const track = TRACKS[trackIndexRef.current];
          if (track.kind !== 'procedural') return;

          scheduleStep(nextStepTimeRef.current);
          nextStepTimeRef.current += track.stepSeconds;
        }

        trimNodes(audioContext.currentTime);
      }, 120);
    };

    if (shouldFadeOut) {
      clearScheduler();
      fadeCurrentOutput(0, FADE_OUT_MS);
      transitionTimeoutRef.current = window.setTimeout(beginTrack, FADE_OUT_MS);
      return;
    }

    beginTrack();
  }, [
    clearScheduler,
    clearTransition,
    ensureContext,
    fadeCurrentOutput,
    fadeProceduralVolume,
    getEffectiveVolume,
    isPlaying,
    playFile,
    scheduleStep,
    stopFile,
    stopNodes,
    trimNodes,
  ]);

  useEffect(() => {
    startFromRef.current = startFrom;
  }, [startFrom]);

  const toggleMute = useCallback(() => {
    setIsMuted((value) => {
      const nextMuted = !value;
      const context = contextRef.current;
      const audio = audioRef.current;

      if (!nextMuted && context?.state === 'suspended') {
        void context.resume().catch(() => undefined);
      }

      if (audio) {
        audio.muted = nextMuted;
        if (!nextMuted && isPlaying) {
          void audio.play().catch(() => undefined);
        }
      }

      if (!nextMuted && !isPlaying) {
        startFrom(activeIndex);
      }

      return nextMuted;
    });
  }, [activeIndex, isPlaying, startFrom]);

  const pause = useCallback(() => {
    clearTransition();
    clearScheduler();
    fadeCurrentOutput(0, FADE_OUT_MS);
    transitionTimeoutRef.current = window.setTimeout(() => {
      stopNodes();
      stopFile();
    }, FADE_OUT_MS);
    setIsPlaying(false);
  }, [clearScheduler, clearTransition, fadeCurrentOutput, stopFile, stopNodes]);

  useEffect(() => {
    const masterGain = masterGainRef.current;
    const context = contextRef.current;
    if (!masterGain || !context) return;

    const track = TRACKS[trackIndexRef.current];
    if (track.kind !== 'procedural') return;

    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.setTargetAtTime(getEffectiveVolume(track), context.currentTime, 0.08);
  }, [getEffectiveVolume, isMuted, masterVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = TRACKS[trackIndexRef.current];
    if (track.kind !== 'file') return;

    audio.muted = isMuted;
    fadeFileVolume(getEffectiveVolume(track), 140);
  }, [fadeFileVolume, getEffectiveVolume, isMuted, masterVolume]);

  useEffect(() => {
    if (didAutoStartRef.current) return;

    didAutoStartRef.current = true;
    const id = window.setTimeout(() => startFrom(0, { resume: false, fadeOut: false }), 0);
    return () => window.clearTimeout(id);
  }, [startFrom]);

  useEffect(() => () => {
    clearTransition();
    clearScheduler();
    stopNodes();
    stopFile();
    void contextRef.current?.close();
  }, [clearScheduler, clearTransition, stopFile, stopNodes]);

  const palette = useMemo(() => {
    if (isArchive) {
      return {
        panel: 'border-[rgba(36,48,64,0.18)] bg-[rgba(255,255,252,0.78)] text-[#172033]',
        muted: 'text-[#66727f]',
        faint: 'text-[#8a94a0]',
        line: 'bg-[rgba(36,48,64,0.18)]',
        hover: 'hover:text-[#172033]',
        active: 'border-[rgba(36,48,64,0.32)] bg-[rgba(23,32,51,0.06)] text-[#172033]',
      };
    }

    return {
      panel: 'border-white/14 bg-[#05070d]/78 text-white',
      muted: 'text-white/56',
      faint: 'text-white/34',
      line: 'bg-white/14',
      hover: 'hover:text-white/90',
      active: 'border-white/28 bg-white/8 text-white',
    };
  }, [isArchive]);

  return (
    <div className="pointer-events-auto absolute bottom-5 left-5 z-20 sm:bottom-7 sm:left-7">
      <div
        className={cn(
          'w-[min(18rem,calc(100vw-2.5rem))] border px-3 py-2 shadow-[0_18px_52px_rgba(0,0,0,0.22)] backdrop-blur-md transition-[border-color,background-color,opacity] duration-200 ease-[var(--ease-out-quint)]',
          palette.panel,
        )}
      >
        {/* Instrumental background music has no spoken content to caption. */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          ref={audioRef}
          aria-hidden="true"
          preload="auto"
          onEnded={() => startFrom((activeIndex + 1) % TRACKS.length, { fadeOut: false })}
        />

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className={cn(
              'min-w-0 text-left text-[10px] font-semibold uppercase transition-colors',
              palette.muted,
              palette.hover,
            )}
            style={{ letterSpacing: '0.18em' }}
            aria-expanded={isOpen}
          >
            audio index
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => (isPlaying ? pause() : startFrom(activeIndex))}
              className={cn(
                'grid size-7 place-items-center border transition-colors',
                isArchive
                  ? 'border-[rgba(36,48,64,0.16)] text-[#66727f] hover:border-[rgba(36,48,64,0.3)] hover:text-[#172033]'
                  : 'border-white/12 text-white/55 hover:border-white/24 hover:text-white/90',
              )}
              aria-label={isPlaying ? 'Pause audio index' : 'Play audio index'}
            >
              {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className={cn(
                'grid size-7 place-items-center border transition-colors',
                isArchive
                  ? 'border-[rgba(36,48,64,0.16)] text-[#66727f] hover:border-[rgba(36,48,64,0.3)] hover:text-[#172033]'
                  : 'border-white/12 text-white/55 hover:border-white/24 hover:text-white/90',
              )}
              aria-label={isMuted ? 'Unmute audio index' : 'Mute audio index'}
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>
          </div>
        </div>

        <div className={cn('mt-2 h-px', palette.line)} />

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="mt-2 flex w-full items-center justify-between gap-3 text-left"
        >
          <span
            className={cn('truncate text-xs uppercase', isArchive ? 'text-[#172033]' : 'text-white/86')}
            style={{ letterSpacing: '0.12em' }}
          >
            {currentTrack.title}
          </span>
          <span
            className={cn('shrink-0 text-[10px] uppercase', palette.faint)}
            style={{ letterSpacing: '0.16em' }}
          >
            {isPlaying ? 'on air' : 'standby'}
          </span>
        </button>

        <div
          className={cn(
            'grid overflow-hidden transition-[grid-template-rows,opacity,transform,margin-top] duration-300 ease-[var(--ease-out-quint)] motion-reduce:transition-none',
            isOpen
              ? 'mt-2 grid-rows-[1fr] translate-y-0 opacity-100'
              : 'mt-0 grid-rows-[0fr] -translate-y-1 opacity-0',
          )}
          aria-hidden={!isOpen}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-1">
              <div
                className={cn(
                  'border px-2 py-2 transition-[border-color,background-color,opacity,transform] duration-300 ease-[var(--ease-out-quint)] motion-reduce:transition-none',
                  isArchive
                    ? 'border-[rgba(36,48,64,0.1)] bg-[rgba(23,32,51,0.035)]'
                    : 'border-white/8 bg-white/[0.035]',
                  isOpen ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                )}
                style={{ transitionDelay: isOpen ? '0ms' : '0ms' }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="audio-signal-gain"
                    className={cn('text-[9px] font-semibold uppercase', palette.faint)}
                    style={{ letterSpacing: '0.16em' }}
                  >
                    signal gain
                  </label>
                  <span
                    className={cn('text-[9px] uppercase', palette.faint)}
                    style={{ letterSpacing: '0.14em' }}
                  >
                    {masterPercent}%
                  </span>
                </div>
                <input
                  id="audio-signal-gain"
                  type="range"
                  min={0}
                  max={MAX_MASTER_VOLUME}
                  step={0.01}
                  value={masterVolume}
                  tabIndex={isOpen ? 0 : -1}
                  onChange={(event) => setMasterVolume(Number(event.target.value))}
                  className={cn(
                    'block h-4 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
                    '[&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-current/30',
                    '[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-current',
                    '[&::-moz-range-track]:h-px [&::-moz-range-track]:bg-current/30 [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-current',
                    isArchive ? 'text-[#477c86]' : 'text-[#aad7dc]',
                  )}
                  aria-label="Signal gain"
                />
              </div>
              {TRACKS.map((track, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => startFrom(index)}
                    tabIndex={isOpen ? 0 : -1}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 border px-2 py-1.5 text-left transition-[border-color,background-color,color,opacity,transform] duration-300 ease-[var(--ease-out-quint)] motion-reduce:transition-none',
                      isArchive
                        ? 'border-[rgba(36,48,64,0.1)] text-[#66727f] hover:border-[rgba(36,48,64,0.24)] hover:text-[#172033]'
                        : 'border-white/8 text-white/52 hover:border-white/20 hover:text-white/88',
                      isOpen ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                      isActive && palette.active,
                    )}
                    style={{ transitionDelay: isOpen ? `${(index + 1) * 34}ms` : '0ms' }}
                  >
                    <span className="min-w-0">
                      <span
                        className="block truncate text-[11px] font-medium uppercase"
                        style={{ letterSpacing: '0.12em' }}
                      >
                        {track.title}
                      </span>
                      <span
                        className={cn('mt-0.5 block text-[9px] uppercase', palette.faint)}
                        style={{ letterSpacing: '0.16em' }}
                      >
                        {track.code}
                      </span>
                    </span>
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: isActive ? track.accent : 'transparent',
                        boxShadow: isActive ? `0 0 14px ${track.accent}` : 'none',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
