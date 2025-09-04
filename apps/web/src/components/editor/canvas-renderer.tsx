"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRafLoop } from "@/hooks/use-raf-loop";
import { renderTimelineFrame } from "@/lib/timeline-renderer";
import { useTimelineStore } from "@/stores/timeline-store";
import { useMediaStore } from "@/stores/media-store";
import { usePlaybackStore } from "@/stores/playback-store";
import { useProjectStore, DEFAULT_FPS } from "@/stores/project-store";
import { useFrameCache } from "@/hooks/use-frame-cache";

interface CanvasRendererProps {
  width: number;
  height: number;
  className?: string;
}

export function CanvasRenderer({
  width,
  height,
  className,
}: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFrameRef = useRef(-1);
  const renderingRef = useRef(false);
  const pendingFrameRef = useRef<number | null>(null);

  const { tracks } = useTimelineStore();
  const { mediaFiles } = useMediaStore();
  const { activeProject } = useProjectStore();

  const { getCachedFrame, cacheFrame, preRenderNearbyFrames } = useFrameCache();

  const fps = useMemo(
    () => activeProject?.fps || DEFAULT_FPS,
    [activeProject?.fps]
  );

  const renderFrame = useCallback(
    async (time: number, frame: number) => {
      const canvas = canvasRef.current;
      if (!canvas || renderingRef.current) return;

      renderingRef.current = true;
      pendingFrameRef.current = null;

      try {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const cachedFrame = getCachedFrame(
          time,
          tracks,
          mediaFiles,
          activeProject
        );
        if (cachedFrame) {
          ctx.putImageData(cachedFrame, 0, 0);
          preRenderNearbyFrames(
            time,
            tracks,
            mediaFiles,
            activeProject,
            async (preRenderTime: number) => {
              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = width;
              tempCanvas.height = height;
              const tempCtx = tempCanvas.getContext("2d");
              if (!tempCtx)
                throw new Error("Failed to create temp canvas context");

              await renderTimelineFrame({
                ctx: tempCtx,
                time: preRenderTime,
                canvasWidth: width,
                canvasHeight: height,
                tracks,
                mediaFiles,
                backgroundColor:
                  activeProject?.backgroundType === "blur"
                    ? undefined
                    : activeProject?.backgroundColor || "#000000",
                backgroundType: activeProject?.backgroundType,
                blurIntensity: activeProject?.blurIntensity,
                projectCanvasSize: activeProject?.canvasSize,
              });

              return tempCtx.getImageData(0, 0, width, height);
            }
          );
          return;
        }
        await renderTimelineFrame({
          ctx,
          time,
          canvasWidth: width,
          canvasHeight: height,
          tracks,
          mediaFiles,
          backgroundColor:
            activeProject?.backgroundType === "blur"
              ? undefined
              : activeProject?.backgroundColor || "#000000",
          backgroundType: activeProject?.backgroundType,
          blurIntensity: activeProject?.blurIntensity,
          projectCanvasSize: activeProject?.canvasSize,
        });

        const imageData = ctx.getImageData(0, 0, width, height);
        cacheFrame(time, imageData, tracks, mediaFiles, activeProject);
      } catch (error) {
        console.error("Frame render failed:", error);
      } finally {
        renderingRef.current = false;

        if (pendingFrameRef.current !== null) {
          const pendingFrame = pendingFrameRef.current;
          const pendingTime = pendingFrame / fps;
          pendingFrameRef.current = null;
          void renderFrame(pendingTime, pendingFrame);
        }
      }
    },
    [
      tracks,
      mediaFiles,
      activeProject,
      width,
      height,
      fps,
      getCachedFrame,
      cacheFrame,
      preRenderNearbyFrames,
    ]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const time = usePlaybackStore.getState().currentTime;
    const frame = Math.floor(time * fps);

    if (frame === lastFrameRef.current) return;
    lastFrameRef.current = frame;

    if (renderingRef.current) {
      pendingFrameRef.current = frame;
      return;
    }

    void renderFrame(time, frame);
  }, [renderFrame, fps]);

  useRafLoop(render);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  );
}
