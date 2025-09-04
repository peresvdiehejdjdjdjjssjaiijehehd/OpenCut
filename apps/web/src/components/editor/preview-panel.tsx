"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Expand } from "lucide-react";
import { CanvasRenderer } from "./canvas-renderer";
import { LayoutGuideOverlay } from "./layout-guide-overlay";
import { useTimelineStore } from "@/stores/timeline-store";
import { usePlaybackStore } from "@/stores/playback-store";
import { useProjectStore, DEFAULT_CANVAS_SIZE } from "@/stores/project-store";
import { useMediaStore } from "@/stores/media-store";
import { usePreviewAudio } from "@/hooks/use-preview-audio";

function usePreviewSize() {
  const { activeProject } = useProjectStore();
  return {
    width: activeProject?.canvasSize?.width || DEFAULT_CANVAS_SIZE.width,
    height: activeProject?.canvasSize?.height || DEFAULT_CANVAS_SIZE.height,
  };
}

function usePreviewDimensions(containerRef: React.RefObject<HTMLDivElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width: canvasWidth, height: canvasHeight } = usePreviewSize();

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const computedStyle = getComputedStyle(containerRef.current);
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      const paddingRight = parseFloat(computedStyle.paddingRight);
      const gap = parseFloat(computedStyle.gap) || 16;

      const toolbar = containerRef.current.querySelector("[data-toolbar]");
      const toolbarHeight = toolbar
        ? toolbar.getBoundingClientRect().height
        : 0;

      const availableWidth = container.width - paddingLeft - paddingRight;
      const availableHeight =
        container.height -
        paddingTop -
        paddingBottom -
        toolbarHeight -
        (toolbarHeight > 0 ? gap : 0);

      const targetRatio = canvasWidth / canvasHeight;
      const containerRatio = availableWidth / availableHeight;

      let width, height;
      if (containerRatio > targetRatio) {
        height = availableHeight;
        width = height * targetRatio;
      } else {
        width = availableWidth;
        height = width / targetRatio;
      }

      setDimensions({ width, height });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [canvasWidth, canvasHeight]);

  return dimensions;
}

export function PreviewPanel() {
  const { tracks } = useTimelineStore();
  const { isPlaying, toggle } = usePlaybackStore();
  const { activeProject } = useProjectStore();
  const { mediaFiles } = useMediaStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  usePreviewAudio(mediaFiles);

  const previewDimensions = usePreviewDimensions(containerRef);
  const hasAnyElements = tracks.some((track) => track.elements.length > 0);
  const shouldRenderPreview = hasAnyElements || activeProject?.backgroundType;

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-9999 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-background">
          <div
            className="relative overflow-hidden border border-border m-3"
            style={{
              width: Math.min(
                previewDimensions.width * 1.5,
                window.innerWidth * 0.9
              ),
              height: Math.min(
                previewDimensions.height * 1.5,
                window.innerHeight * 0.8
              ),
            }}
          >
            <CanvasRenderer
              width={Math.min(
                previewDimensions.width * 1.5,
                window.innerWidth * 0.9
              )}
              height={Math.min(
                previewDimensions.height * 1.5,
                window.innerHeight * 0.8
              )}
              className="w-full h-full"
            />
            <LayoutGuideOverlay />
          </div>
        </div>
        <div className="p-4 bg-background">
          <Button onClick={toggleExpanded}>Exit Fullscreen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col min-h-0 min-w-0 bg-panel rounded-sm relative">
      <div
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center min-h-0 min-w-0"
      >
        <div className="flex-1" />
        {shouldRenderPreview ? (
          <div
            className="relative overflow-hidden border"
            style={{
              width: previewDimensions.width,
              height: previewDimensions.height,
            }}
          >
            <CanvasRenderer
              width={Math.floor(previewDimensions.width)}
              height={Math.floor(previewDimensions.height)}
              className="w-full h-full"
            />
            <LayoutGuideOverlay />
          </div>
        ) : null}
        <div className="flex-1" />

        <div
          data-toolbar
          className="flex justify-end gap-2 h-auto pb-5 pr-5 pt-4 w-full"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="text"
              size="icon"
              onClick={toggle}
              disabled={!hasAnyElements}
              className="h-auto p-0"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="text"
              size="icon"
              className="size-4!"
              onClick={toggleExpanded}
              title="Enter fullscreen"
            >
              <Expand className="size-4!" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
