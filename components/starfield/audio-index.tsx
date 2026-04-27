'use client';

import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

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
const PROGRESS_UPDATE_MS = 250;

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

function getTrackDuration(track: Track) {
  if (track.kind === 'file') return 0;
  return track.stepSeconds * track.chords.length * 2;
}

function formatTime(seconds: number, fallback = '0:00') {
  if (!Number.isFinite(seconds) || seconds < 0) return fallback;

  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function AudioIndex({ isArchive }: { isArchive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTrackListOpen, setIsTrackListOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [masterVolume, setMasterVolume] = useState(DEFAULT_MASTER_VOLUME);
  const [panelHeight, setPanelHeight] = useState(56);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelSummaryRef = useRef<HTMLDivElement | null>(null);
  const panelDetailsRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const fileFadeFrameRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const proceduralStartedAtRef = useRef(0);
  const pausedProgressRef = useRef(0);
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
  const progressRatio = durationSeconds > 0
    ? Math.min(1, Math.max(0, progressSeconds / durationSeconds))
    : 0;

  useLayoutEffect(() => {
    let frameId: number;
    const updatePanelHeight = (height: number) => {
      frameId = window.requestAnimationFrame(() => setPanelHeight(height));
    };

    if (!isOpen) {
      updatePanelHeight(56);
      return () => window.cancelAnimationFrame(frameId);
    }

    const summary = panelSummaryRef.current;
    if (!summary) return;

    const updateHeight = () => {
      const details = panelDetailsRef.current;
      const detailsHeight = isTrackListOpen && details ? details.scrollHeight : 0;
      updatePanelHeight(summary.scrollHeight + detailsHeight + 24);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(summary);
    if (panelDetailsRef.current) {
      observer.observe(panelDetailsRef.current);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [isOpen, isTrackListOpen]);

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

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProceduralProgress = useCallback((
    track: ProceduralTrack,
    context: AudioContext,
    elapsedSeconds = 0,
  ) => {
    clearProgressTimer();

    const duration = getTrackDuration(track);
    proceduralStartedAtRef.current = context.currentTime - elapsedSeconds;
    setProgressSeconds(Math.min(duration, Math.max(0, elapsedSeconds)));
    setDurationSeconds(duration);

    progressTimerRef.current = window.setInterval(() => {
      const activeTrack = TRACKS[trackIndexRef.current];
      const audioContext = contextRef.current;
      if (!audioContext || activeTrack.kind !== 'procedural') return;

      const activeDuration = getTrackDuration(activeTrack);
      const elapsed = audioContext.currentTime - proceduralStartedAtRef.current;
      setProgressSeconds(Math.min(activeDuration, Math.max(0, elapsed)));
      setDurationSeconds(activeDuration);
    }, PROGRESS_UPDATE_MS);

  }, [clearProgressTimer]);

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

  const startProceduralScheduler = useCallback((
    track: ProceduralTrack,
    context: AudioContext,
    elapsedSeconds = 0,
  ) => {
    const duration = getTrackDuration(track);
    const normalizedElapsed = duration > 0 ? elapsedSeconds % duration : 0;
    const step = Math.floor(normalizedElapsed / track.stepSeconds);
    const stepOffset = normalizedElapsed - step * track.stepSeconds;
    const isAtStepStart = stepOffset < 0.001;

    stepRef.current = isAtStepStart ? step : step + 1;
    proceduralStartedAtRef.current = context.currentTime - normalizedElapsed;
    nextStepTimeRef.current = context.currentTime + (
      isAtStepStart ? 0.08 : Math.max(0.08, track.stepSeconds - stepOffset)
    );

    schedulerRef.current = window.setInterval(() => {
      const audioContext = contextRef.current;
      if (!audioContext) return;

      while (nextStepTimeRef.current < audioContext.currentTime + 0.42) {
        const activeTrack = TRACKS[trackIndexRef.current];
        if (activeTrack.kind !== 'procedural') return;

        scheduleStep(nextStepTimeRef.current);
        nextStepTimeRef.current += activeTrack.stepSeconds;
      }

      trimNodes(audioContext.currentTime);
    }, 120);
  }, [scheduleStep, trimNodes]);

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
      clearProgressTimer();
      stopNodes();
      stopFile();
      trackIndexRef.current = index;
      stepRef.current = 0;
      pausedProgressRef.current = 0;
      setActiveIndex(index);
      setIsPlaying(true);
      setProgressSeconds(0);
      setDurationSeconds(getTrackDuration(track));

      if (track.kind === 'file') {
        playFile(track, true);
        return;
      }

      const context = ensureContext();

      if (options.resume !== false && context.state === 'suspended') {
        void context.resume().catch(() => undefined);
      }

      fadeProceduralVolume(0, 0);
      fadeProceduralVolume(getEffectiveVolume(track), FADE_IN_MS);
      startProceduralProgress(track, context, 0);
      startProceduralScheduler(track, context, 0);
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
    clearProgressTimer,
    clearTransition,
    ensureContext,
    fadeCurrentOutput,
    fadeProceduralVolume,
    getEffectiveVolume,
    isPlaying,
    playFile,
    startProceduralProgress,
    startProceduralScheduler,
    stopFile,
    stopNodes,
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
    clearProgressTimer();
    const track = TRACKS[trackIndexRef.current];
    const audio = audioRef.current;

    if (track.kind === 'file' && audio) {
      pausedProgressRef.current = audio.currentTime;
      audio.pause();
      setProgressSeconds(audio.currentTime);
      setIsPlaying(false);
      return;
    }

    const context = contextRef.current;
    if (track.kind === 'procedural' && context) {
      const duration = getTrackDuration(track);
      const elapsed = Math.max(0, context.currentTime - proceduralStartedAtRef.current);
      pausedProgressRef.current = duration > 0 ? elapsed % duration : elapsed;
      setProgressSeconds(pausedProgressRef.current);
    }

    fadeCurrentOutput(0, FADE_OUT_MS);
    transitionTimeoutRef.current = window.setTimeout(() => {
      stopNodes();
    }, FADE_OUT_MS);
    setIsPlaying(false);
  }, [clearScheduler, clearProgressTimer, clearTransition, fadeCurrentOutput, stopNodes]);

  const resume = useCallback(() => {
    clearTransition();
    const track = TRACKS[trackIndexRef.current];

    setIsPlaying(true);

    if (track.kind === 'file') {
      const audio = audioRef.current;
      if (!audio) {
        startFrom(activeIndex, { fadeOut: false });
        return;
      }

      audio.muted = isMuted;
      audio.currentTime = pausedProgressRef.current || audio.currentTime;
      void audio.play().catch(() => undefined);
      fadeFileVolume(getEffectiveVolume(track), FADE_IN_MS);
      return;
    }

    const context = ensureContext();
    if (context.state === 'suspended') {
      void context.resume().catch(() => undefined);
    }

    clearScheduler();
    stopNodes();
    fadeProceduralVolume(0, 0);
    fadeProceduralVolume(getEffectiveVolume(track), FADE_IN_MS);
    startProceduralScheduler(track, context, pausedProgressRef.current);
    startProceduralProgress(track, context, pausedProgressRef.current);
  }, [
    activeIndex,
    clearScheduler,
    clearTransition,
    ensureContext,
    fadeFileVolume,
    fadeProceduralVolume,
    getEffectiveVolume,
    isMuted,
    startFrom,
    startProceduralProgress,
    startProceduralScheduler,
    stopNodes,
  ]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
      return;
    }

    resume();
  }, [isPlaying, pause, resume]);

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
    clearProgressTimer();
    stopNodes();
    stopFile();
    void contextRef.current?.close();
  }, [clearScheduler, clearProgressTimer, clearTransition, stopFile, stopNodes]);

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
    <div
      className={cn(
        'pointer-events-auto absolute right-2 top-2 z-20 transition-[width,height] duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none sm:right-4 sm:top-4',
        isOpen ? 'w-[min(18rem,calc(100vw-2.5rem))]' : 'w-14',
      )}
      style={{ height: panelHeight }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
    >
      {/* Instrumental background music has no spoken content to caption. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        aria-hidden="true"
        preload="auto"
        onLoadedMetadata={(event) => {
          const duration = event.currentTarget.duration;
          if (Number.isFinite(duration)) {
            setDurationSeconds(duration);
          }
        }}
        onTimeUpdate={(event) => {
          const activeTrack = TRACKS[trackIndexRef.current];
          if (activeTrack.kind !== 'file') return;

          setProgressSeconds(event.currentTarget.currentTime);
          if (Number.isFinite(event.currentTarget.duration)) {
            setDurationSeconds(event.currentTarget.duration);
          }
        }}
        onEnded={() => startFrom((activeIndex + 1) % TRACKS.length, { fadeOut: false })}
      />

      <div
        className={cn(
          'absolute right-0 top-0 size-full overflow-hidden border shadow-[0_18px_52px_rgba(0,0,0,0.22)] backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          palette.panel,
          !isOpen && 'border-transparent bg-transparent shadow-none backdrop-blur-none',
        )}
        aria-hidden={!isOpen}
      />

      <button
        type="button"
        onClick={toggleMute}
        className={cn(
          'absolute right-3 top-3 z-20 grid size-7 place-items-center border transition-[border-color,background-color,color] duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          isArchive
            ? 'border-[rgba(36,48,64,0.16)] bg-transparent text-[#66727f] hover:border-[rgba(36,48,64,0.3)] hover:text-[#172033]'
            : 'border-white/12 bg-transparent text-white/55 hover:border-white/24 hover:text-white/90',
        )}
        aria-expanded={isOpen}
        aria-label={isMuted ? 'Unmute audio index' : 'Mute audio index'}
      >
        {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </button>

      <div
        className={cn(
          'absolute inset-0 overflow-hidden px-3 py-3 transition-[opacity] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen
            ? 'opacity-100 delay-150'
            : 'pointer-events-none opacity-0 delay-0',
        )}
        aria-hidden={!isOpen}
      >
        <div ref={panelSummaryRef}>
          <div className="mb-3 flex min-h-7 items-center justify-between gap-3 pr-16">
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              tabIndex={isOpen ? 0 : -1}
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

            <button
              type="button"
              onClick={togglePlayback}
              tabIndex={isOpen ? 0 : -1}
              className={cn(
                'absolute right-12 top-3 grid size-7 shrink-0 place-items-center border transition-colors',
                isArchive
                  ? 'border-[rgba(36,48,64,0.16)] text-[#66727f] hover:border-[rgba(36,48,64,0.3)] hover:text-[#172033]'
                  : 'border-white/12 text-white/55 hover:border-white/24 hover:text-white/90',
              )}
              aria-label={isPlaying ? 'Pause audio index' : 'Play audio index'}
            >
              {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
          </div>

          <div className={cn('mb-2 h-px', palette.line)} />

          <button
            type="button"
            onClick={() => setIsTrackListOpen((value) => !value)}
            tabIndex={isOpen ? 0 : -1}
            className="flex w-full items-center justify-between gap-3 text-left"
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

          <div className={cn('mt-2 flex items-center gap-3', isTrackListOpen && 'mb-2')}>
            <div
              className={cn(
                'h-px flex-1 overflow-hidden',
                isArchive ? 'bg-[rgba(36,48,64,0.16)]' : 'bg-white/12',
              )}
              aria-hidden="true"
            >
              <div
                className={cn('h-full', isArchive ? 'bg-[#477c86]' : 'bg-[#aad7dc]')}
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
            <div
              className={cn('shrink-0 text-[9px] uppercase tabular-nums', palette.faint)}
              style={{ letterSpacing: '0.12em' }}
            >
              {formatTime(progressSeconds)} / {formatTime(durationSeconds, '--:--')}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'grid overflow-hidden transition-[grid-template-rows,transform,margin-top] duration-300 ease-[var(--ease-out-quint)] motion-reduce:transition-none',
            isOpen && isTrackListOpen
              ? 'mt-2 grid-rows-[1fr] translate-y-0'
              : 'mt-0 grid-rows-[0fr] -translate-y-1',
          )}
        >
          <div className="min-h-0 overflow-hidden" ref={panelDetailsRef}>
            <div className="space-y-1">
              <div
                className={cn(
                  'border px-2 py-2 transition-[border-color,background-color,opacity,transform] duration-300 ease-[var(--ease-out-quint)] motion-reduce:transition-none',
                  isArchive
                    ? 'border-[rgba(36,48,64,0.1)] bg-[rgba(23,32,51,0.035)]'
                    : 'border-white/8 bg-white/[0.035]',
                  isOpen && isTrackListOpen ? 'translate-y-0' : '-translate-y-1',
                )}
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
                  tabIndex={isOpen && isTrackListOpen ? 0 : -1}
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
                    tabIndex={isOpen && isTrackListOpen ? 0 : -1}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 border px-2 py-1.5 text-left transition-[border-color,background-color,color,opacity,transform] duration-300 ease-[var(--ease-out-quint)] motion-reduce:transition-none',
                      isArchive
                        ? 'border-[rgba(36,48,64,0.1)] text-[#66727f] hover:border-[rgba(36,48,64,0.24)] hover:text-[#172033]'
                        : 'border-white/8 text-white/52 hover:border-white/20 hover:text-white/88',
                      isOpen && isTrackListOpen ? 'translate-y-0' : '-translate-y-1',
                      isActive && palette.active,
                    )}
                    style={{ transitionDelay: isOpen && isTrackListOpen ? `${(index + 1) * 34}ms` : '0ms' }}
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
