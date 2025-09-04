import { useRef, useEffect } from "react";
import { useTimelineStore } from "@/stores/timeline-store";
import { usePlaybackStore } from "@/stores/playback-store";
import { MediaFile } from "@/types/media";

export function usePreviewAudio(mediaFiles: MediaFile[]) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const playingSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const { isPlaying, volume, muted } = usePlaybackStore();

  useEffect(() => {
    const stopAll = () => {
      for (const src of playingSourcesRef.current) {
        try {
          src.stop();
        } catch {}
      }
      playingSourcesRef.current.clear();
    };

    type WebAudioWindow = Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };

    const ensureAudioGraph = async () => {
      if (!audioContextRef.current) {
        const win = window as WebAudioWindow;
        const Ctx = win.AudioContext ?? win.webkitAudioContext;
        if (!Ctx) return;
        audioContextRef.current = new Ctx();
      }
      if (!audioGainRef.current) {
        audioGainRef.current = audioContextRef.current!.createGain();
        audioGainRef.current.connect(audioContextRef.current!.destination);
      }
      if (audioContextRef.current!.state === "suspended") {
        try {
          await audioContextRef.current!.resume();
        } catch {}
      }
      const gainValue = muted ? 0 : Math.max(0, Math.min(1, volume));
      audioGainRef.current!.gain.setValueAtTime(
        gainValue,
        audioContextRef.current!.currentTime
      );
    };

    const scheduleNow = async () => {
      await ensureAudioGraph();
      const audioCtx = audioContextRef.current!;
      const gain = audioGainRef.current!;

      const tracksSnapshot = useTimelineStore.getState().tracks;
      const mediaList = mediaFiles;
      const idToMedia = new Map(mediaList.map((m) => [m.id, m] as const));
      const playbackNow = usePlaybackStore.getState().currentTime;

      const audible: Array<{
        id: string;
        elementStart: number;
        trimStart: number;
        trimEnd: number;
        duration: number;
        muted: boolean;
        trackMuted: boolean;
      }> = [];
      const uniqueIds = new Set<string>();

      for (const track of tracksSnapshot) {
        for (const element of track.elements) {
          if (element.type !== "media") continue;
          const media = idToMedia.get(element.mediaId);
          if (!media || media.type !== "audio") continue;
          const visibleDuration =
            element.duration - element.trimStart - element.trimEnd;
          if (visibleDuration <= 0) continue;
          const localTime = playbackNow - element.startTime + element.trimStart;
          if (localTime < 0 || localTime >= visibleDuration) continue;

          const mediaElement = element;
          audible.push({
            id: media.id,
            elementStart: element.startTime,
            trimStart: element.trimStart,
            trimEnd: element.trimEnd,
            duration: element.duration,
            muted: !!mediaElement.muted,
            trackMuted: !!track.muted,
          });
          uniqueIds.add(media.id);
        }
      }

      if (audible.length === 0) return;

      const decodePromises: Array<Promise<void>> = [];
      for (const id of uniqueIds) {
        if (!audioBuffersRef.current.has(id)) {
          const mediaItem = idToMedia.get(id);
          if (!mediaItem) continue;
          const p = (async () => {
            const arr = await mediaItem.file.arrayBuffer();
            const buf = await audioCtx.decodeAudioData(arr.slice(0));
            audioBuffersRef.current.set(id, buf);
          })();
          decodePromises.push(p);
        }
      }
      await Promise.all(decodePromises);

      const startAt = audioCtx.currentTime + 0.02;
      for (const entry of audible) {
        if (entry.muted || entry.trackMuted) continue;
        const buffer = audioBuffersRef.current.get(entry.id);
        if (!buffer) continue;
        const visibleDuration =
          entry.duration - entry.trimStart - entry.trimEnd;
        const localTime = Math.max(
          0,
          playbackNow - entry.elementStart + entry.trimStart
        );
        const playDuration = Math.max(0, visibleDuration - localTime);
        if (playDuration <= 0) continue;
        const src = audioCtx.createBufferSource();
        src.buffer = buffer;
        src.connect(gain);
        try {
          src.start(startAt, localTime, playDuration);
          playingSourcesRef.current.add(src);
        } catch {}
      }
    };

    const onSeek = () => {
      if (!isPlaying) return;
      for (const src of playingSourcesRef.current) {
        try {
          src.stop();
        } catch {}
      }
      playingSourcesRef.current.clear();
      void scheduleNow();
    };

    void ensureAudioGraph();

    for (const src of playingSourcesRef.current) {
      try {
        src.stop();
      } catch {}
    }
    playingSourcesRef.current.clear();
    if (isPlaying) {
      void scheduleNow();
    }

    window.addEventListener("playback-seek", onSeek as EventListener);
    return () => {
      window.removeEventListener("playback-seek", onSeek as EventListener);
      for (const src of playingSourcesRef.current) {
        try {
          src.stop();
        } catch {}
      }
      playingSourcesRef.current.clear();
    };
  }, [isPlaying, volume, muted, mediaFiles]);
}
