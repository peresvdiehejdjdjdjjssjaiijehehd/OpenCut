"use client";

import { useRef } from "react";
import {
	getTotalTracksHeight,
	TIMELINE_CONSTANTS,
} from "@/constants/timeline-constants";
import { useTimelinePlayhead } from "@/hooks/use-timeline-playhead";
import type { TimelineTrack } from "@/types/timeline";

interface TimelinePlayheadProps {
	currentTime: number;
	duration: number;
	zoomLevel: number;
	tracks: TimelineTrack[];
	seek: (time: number) => void;
	rulerRef: React.RefObject<HTMLDivElement>;
	rulerScrollRef: React.RefObject<HTMLDivElement>;
	tracksScrollRef: React.RefObject<HTMLDivElement>;
	trackLabelsRef?: React.RefObject<HTMLDivElement>;
	timelineRef: React.RefObject<HTMLDivElement>;
	playheadRef?: React.RefObject<HTMLDivElement>;
	isSnappingToPlayhead?: boolean;
}

export function TimelinePlayhead({
	currentTime,
	duration,
	zoomLevel,
	tracks,
	seek,
	rulerRef,
	rulerScrollRef,
	tracksScrollRef,
	trackLabelsRef,
	timelineRef,
	playheadRef: externalPlayheadRef,
	isSnappingToPlayhead = false,
}: TimelinePlayheadProps) {
	const internalPlayheadRef = useRef<HTMLDivElement>(null);
	const playheadRef = externalPlayheadRef || internalPlayheadRef;
	const { playheadPosition, handlePlayheadMouseDown } = useTimelinePlayhead({
		currentTime,
		duration,
		zoomLevel,
		seek,
		rulerRef,
		rulerScrollRef,
		tracksScrollRef,
		playheadRef,
	});

	// Use timeline container height minus a few pixels for breathing room
	const timelineContainerHeight = timelineRef.current?.offsetHeight || 400;
	const totalHeight = timelineContainerHeight - 8; // 8px padding from edges

	// Get dynamic track labels width, fallback to 0 if no tracks or no ref
	const trackLabelsWidth =
		tracks.length > 0 && trackLabelsRef?.current
			? trackLabelsRef.current.offsetWidth
			: 0;
	const leftPosition =
		trackLabelsWidth +
		playheadPosition * TIMELINE_CONSTANTS.PIXELS_PER_SECOND * zoomLevel;

	return (
		<div
			className="pointer-events-auto absolute z-[150]"
			onMouseDown={handlePlayheadMouseDown}
			ref={playheadRef}
			style={{
				left: `${leftPosition}px`,
				top: 0,
				height: `${totalHeight}px`,
				width: "2px", // Slightly wider for better click target
			}}
		>
			{/* The playhead line spanning full height */}
			<div
				className={`absolute left-0 h-full w-0.5 cursor-col-resize ${isSnappingToPlayhead ? "bg-primary" : "bg-foreground"}`}
			/>

			{/* Playhead dot indicator at the top (in ruler area) */}
			<div
				className={`-translate-x-1/2 absolute top-1 left-1/2 h-3 w-3 transform rounded-full border-2 shadow-sm ${isSnappingToPlayhead ? "border-primary bg-primary" : "border-foreground bg-foreground"}`}
			/>
		</div>
	);
}

// Also export a hook for getting ruler handlers
export function useTimelinePlayheadRuler({
	currentTime,
	duration,
	zoomLevel,
	seek,
	rulerRef,
	rulerScrollRef,
	tracksScrollRef,
	playheadRef,
}: Omit<TimelinePlayheadProps, "tracks" | "trackLabelsRef" | "timelineRef">) {
	const { handleRulerMouseDown, isDraggingRuler } = useTimelinePlayhead({
		currentTime,
		duration,
		zoomLevel,
		seek,
		rulerRef,
		rulerScrollRef,
		tracksScrollRef,
		playheadRef,
	});

	return { handleRulerMouseDown, isDraggingRuler };
}

export { TimelinePlayhead as default };
