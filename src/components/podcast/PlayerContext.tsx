import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PodcastEpisode } from "@/src/data/mockPodcasts";
import { setEpisodeProgress, getEpisodeProgress } from "@/src/data/mockPodcasts";

export type Speed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
export const SPEEDS: Speed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface PlayerState {
  current: PodcastEpisode | null;
  queue: PodcastEpisode[];
  playing: boolean;
  speed: Speed;
  currentTime: number;
  duration: number;
  play: (ep: PodcastEpisode, queue?: PodcastEpisode[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  skip: (delta: number) => void;
  setSpeed: (s: Speed) => void;
  addToQueue: (ep: PodcastEpisode) => void;
  clear: () => void;
}

const Ctx = createContext<PlayerState | null>(null);

export function PodcastPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PodcastEpisode | null>(null);
  const [queue, setQueue] = useState<PodcastEpisode[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState<Speed>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Single shared <audio> element = background playback across route changes.
  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    audioRef.current = a;
    const onTime = () => {
      setCurrentTime(a.currentTime);
      if (currentRef.current && a.currentTime > 0 && Math.floor(a.currentTime) % 10 === 0) {
        setEpisodeProgress(currentRef.current.slug, a.currentTime);
      }
    };
    const onDur = () => setDuration(a.duration || 0);
    const onEnd = () => {
      if (currentRef.current) setEpisodeProgress(currentRef.current.slug, 0);
      nextRef.current();
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    // Media Session API — lock-screen / background controls
    try {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", () => a.play().catch(() => {}));
        navigator.mediaSession.setActionHandler("pause", () => a.pause());
        navigator.mediaSession.setActionHandler("previoustrack", () => prevRef.current());
        navigator.mediaSession.setActionHandler("nexttrack", () => nextRef.current());
        navigator.mediaSession.setActionHandler("seekto", (d) => {
          if (typeof d.seekTime === "number") a.currentTime = d.seekTime;
        });
      }
    } catch { /* unsupported */ }
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const currentRef = useRef(current);
  currentRef.current = current;

  const syncMediaSession = useCallback((ep: PodcastEpisode | null) => {
    try {
      if ("mediaSession" in navigator && ep) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: ep.title,
          artist: "VideoHub Podcasts",
          album: ep.showSlug,
        });
      }
    } catch { /* unsupported */ }
  }, []);

  const play = useCallback(
    (ep: PodcastEpisode, q?: PodcastEpisode[]) => {
      const a = audioRef.current;
      if (!a) return;
      if (q) setQueue(q);
      // Resume from saved progress
      const saved = getEpisodeProgress()[ep.slug] ?? 0;
      const fresh = currentRef.current?.slug !== ep.slug;
      setCurrent(ep);
      syncMediaSession(ep);
      if (a.src !== ep.audioUrl) a.src = ep.audioUrl;
      a.playbackRate = speedRef.current;
      const start = () => {
        if (fresh && saved > 10 && saved < (a.duration || Infinity) - 15) a.currentTime = saved;
        a.play().catch(() => {});
        setPlaying(true);
      };
      if (a.readyState >= 1) start();
      else a.onloadedmetadata = start;
    },
    [syncMediaSession],
  );

  const speedRef = useRef<Speed>(1);
  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !currentRef.current) return;
    if (a.paused) {
      a.play().catch(() => {});
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
      setEpisodeProgress(currentRef.current.slug, a.currentTime);
    }
  }, []);

  const next = useCallback(() => {
    if (!queue.length || !currentRef.current) return;
    const i = queue.findIndex((e) => e.slug === currentRef.current!.slug);
    const nxt = queue[(i + 1) % queue.length];
    if (nxt) playRef.current(nxt);
  }, []);
  const prev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 5) {
      a.currentTime = 0;
      return;
    }
    if (!queue.length || !currentRef.current) return;
    const i = queue.findIndex((e) => e.slug === currentRef.current!.slug);
    const prv = queue[(i - 1 + queue.length) % queue.length];
    if (prv) playRef.current(prv);
  }, []);

  const playRef = useRef(play);
  playRef.current = play;
  const nextRef = useRef(next);
  nextRef.current = next;
  const prevRef = useRef(prev);
  prevRef.current = prev;

  const seek = useCallback((sec: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration || sec, sec));
    setCurrentTime(a.currentTime);
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const a = audioRef.current;
      if (!a) return;
      seek((a.currentTime || 0) + delta);
    },
    [seek],
  );

  const setSpeed = useCallback((s: Speed) => {
    speedRef.current = s;
    setSpeedState(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }, []);

  const addToQueue = useCallback((ep: PodcastEpisode) => {
    setQueue((q) => (q.some((e) => e.slug === ep.slug) ? q : [...q, ep]));
  }, []);

  const clear = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setCurrent(null);
  }, []);

  const value = useMemo<PlayerState>(
    () => ({ current, queue, playing, speed, currentTime, duration, play, toggle, next, prev, seek, skip, setSpeed, addToQueue, clear }),
    [current, queue, playing, speed, currentTime, duration, play, toggle, next, prev, seek, skip, setSpeed, addToQueue, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePodcastPlayer(): PlayerState {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePodcastPlayer must be used inside PodcastPlayerProvider");
  return v;
}
