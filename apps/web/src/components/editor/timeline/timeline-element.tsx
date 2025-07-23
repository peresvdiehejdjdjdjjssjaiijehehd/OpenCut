"use client";

import { Copy, RefreshCw, Scissors, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	getTrackElementClasses,
	getTrackHeight,
	TIMELINE_CONSTANTS,
} from "@/constants/timeline-constants";
import { useTimelineElementResize } from "@/hooks/use-timeline-element-resize";
import { useMediaStore } from "@/stores/media-store";
import { usePlaybackStore } from "@/stores/playback-store";
import { useTimelineStore } from "@/stores/timeline-store";
import type { TimelineElementProps } from "@/types/timeline";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "../../ui/context-menu";
import AudioWaveform from "../audio-waveform";

export function TimelineElement({
	element,
	track,
	zoomLevel,
	isSelected,
	onElementMouseDown,
	onElementClick,
}: TimelineElementProps) {
	const { mediaItems } = useMediaStore();
	const {
		updateElementTrim,
		updateElementDuration,
		removeElementFromTrack,
		removeElementFromTrackWithRipple,
		dragState,
		splitElement,
		splitAndKeepLeft,
		splitAndKeepRight,
		separateAudio,
		addElementToTrack,
		replaceElementMedia,
		rippleEditingEnabled,
	} = useTimelineStore();
	const { currentTime } = usePlaybackStore();

	const [_elementMenuOpen, _setElementMenuOpen] = useState(false);

	const {
		resizing,
		isResizing,
		handleResizeStart,
		handleResizeMove,
		handleResizeEnd,
	} = useTimelineElementResize({
		element,
		track,
		zoomLevel,
		onUpdateTrim: updateElementTrim,
		onUpdateDuration: updateElementDuration,
	});

	const effectiveDuration =
		element.duration - element.trimStart - element.trimEnd;
	const elementWidth = Math.max(
		TIMELINE_CONSTANTS.ELEMENT_MIN_WIDTH,
		effectiveDuration * TIMELINE_CONSTANTS.PIXELS_PER_SECOND * zoomLevel
	);

	// Use real-time position during drag, otherwise use stored position
	const isBeingDragged = dragState.elementId === element.id;
	const elementStartTime =
		isBeingDragged && dragState.isDragging
			? dragState.currentTime
			: element.startTime;

	// Element should always be positioned at startTime - trimStart only affects content, not position
	const elementLeft = elementStartTime * 50 * zoomLevel;

	const handleElementSplitContext = () => {
		const effectiveStart = element.startTime;
		const effectiveEnd =
			element.startTime +
			(element.duration - element.trimStart - element.trimEnd);

		if (currentTime > effectiveStart && currentTime < effectiveEnd) {
			const secondElementId = splitElement(track.id, element.id, currentTime);
			if (!secondElementId) {
				toast.error("Failed to split element");
			}
		} else {
			toast.error("Playhead must be within element to split");
		}
	};

	const handleElementDuplicateContext = () => {
		const { id, ...elementWithoutId } = element;
		addElementToTrack(track.id, {
			...elementWithoutId,
			name: `${element.name} (copy)`,
			startTime:
				element.startTime +
				(element.duration - element.trimStart - element.trimEnd) +
				0.1,
		});
	};

	const handleElementDeleteContext = () => {
		if (rippleEditingEnabled) {
			removeElementFromTrackWithRipple(track.id, element.id);
		} else {
			removeElementFromTrack(track.id, element.id);
		}
	};

	const handleReplaceClip = () => {
		if (element.type !== "media") {
			toast.error("Replace is only available for media clips");
			return;
		}

		// Create a file input to select replacement media
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "video/*,audio/*,image/*";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) {
				return;
			}

			try {
				const success = await replaceElementMedia(track.id, element.id, file);
				if (success) {
					toast.success("Clip replaced successfully");
				} else {
					toast.error("Failed to replace clip");
				}
			} catch (_error) {
				toast.error("Failed to replace clip");
			}
		};
		input.click();
	};

	const renderElementContent = () => {
		if (element.type === "text") {
			return (
				<div className="flex h-full w-full items-center justify-start pl-2">
					<span className="truncate text-foreground/80 text-xs">
						{element.content}
					</span>
				</div>
			);
		}

		// Render media element ->
		const mediaItem = mediaItems.find((item) => item.id === element.mediaId);
		if (!mediaItem) {
			return (
				<span className="truncate text-foreground/80 text-xs">
					{element.name}
				</span>
			);
		}

		const TILE_ASPECT_RATIO = 16 / 9;

		if (mediaItem.type === "image") {
			// Calculate tile size based on 16:9 aspect ratio
			const trackHeight = getTrackHeight(track.type);
			const tileHeight = trackHeight - 8; // Account for padding
			const tileWidth = tileHeight * TILE_ASPECT_RATIO;

			return (
				<div className="flex h-full w-full items-center justify-center">
					<div className="relative h-full w-full bg-[#004D52] py-3">
						{/* Background with tiled images */}
						<div
							aria-label={`Tiled background of ${mediaItem.name}`}
							className="absolute top-3 right-0 bottom-3 left-0"
							style={{
								backgroundImage: mediaItem.url
									? `url(${mediaItem.url})`
									: "none",
								backgroundRepeat: "repeat-x",
								backgroundSize: `${tileWidth}px ${tileHeight}px`,
								backgroundPosition: "left center",
								pointerEvents: "none",
							}}
						/>
						{/* Overlay with vertical borders */}
						<div
							className="pointer-events-none absolute top-3 right-0 bottom-3 left-0"
							style={{
								backgroundImage: `repeating-linear-gradient(
                  to right,
                  transparent 0px,
                  transparent ${tileWidth - 1}px,
                  rgba(255, 255, 255, 0.6) ${tileWidth - 1}px,
                  rgba(255, 255, 255, 0.6) ${tileWidth}px
                )`,
								backgroundPosition: "left center",
							}}
						/>
					</div>
				</div>
			);
		}

		const _VIDEO_TILE_PADDING = 16;
		const _OVERLAY_SPACE_MULTIPLIER = 1.5;

		if (mediaItem.type === "video" && mediaItem.thumbnailUrl) {
			const trackHeight = getTrackHeight(track.type);
			const tileHeight = trackHeight - 8; // Match image padding
			const tileWidth = tileHeight * TILE_ASPECT_RATIO;

			return (
				<div className="flex h-full w-full items-center justify-center">
					<div className="relative h-full w-full bg-[#004D52] py-3">
						{/* Background with tiled thumbnails */}
						<div
							aria-label={`Tiled thumbnail of ${mediaItem.name}`}
							className="absolute top-3 right-0 bottom-3 left-0"
							style={{
								backgroundImage: mediaItem.thumbnailUrl
									? `url(${mediaItem.thumbnailUrl})`
									: "none",
								backgroundRepeat: "repeat-x",
								backgroundSize: `${tileWidth}px ${tileHeight}px`,
								backgroundPosition: "left center",
								pointerEvents: "none",
							}}
						/>
						{/* Overlay with vertical borders */}
						<div
							className="pointer-events-none absolute top-3 right-0 bottom-3 left-0"
							style={{
								backgroundImage: `repeating-linear-gradient(
                  to right,
                  transparent 0px,
                  transparent ${tileWidth - 1}px,
                  rgba(255, 255, 255, 0.6) ${tileWidth - 1}px,
                  rgba(255, 255, 255, 0.6) ${tileWidth}px
                )`,
								backgroundPosition: "left center",
							}}
						/>
					</div>
				</div>
			);
		}

		// Render audio element ->
		if (mediaItem.type === "audio") {
			return (
				<div className="flex h-full w-full items-center gap-2">
					<div className="min-w-0 flex-1">
						<AudioWaveform
							audioUrl={mediaItem.url || ""}
							className="w-full"
							height={24}
						/>
					</div>
				</div>
			);
		}

		return (
			<span className="truncate text-foreground/80 text-xs">
				{element.name}
			</span>
		);
	};

	const handleElementMouseDown = (e: React.MouseEvent) => {
		if (onElementMouseDown) {
			onElementMouseDown(e, element);
		}
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className={`timeline-element absolute top-0 h-full select-none ${
						isBeingDragged ? "z-50" : "z-10"
					}`}
					data-element-id={element.id}
					data-track-id={track.id}
					onMouseLeave={resizing ? handleResizeEnd : undefined}
					onMouseMove={resizing ? handleResizeMove : undefined}
					onMouseUp={resizing ? handleResizeEnd : undefined}
					style={{
						left: `${elementLeft}px`,
						width: `${elementWidth}px`,
					}}
				>
					<div
						className={`relative h-full cursor-pointer overflow-hidden rounded-[0.15rem] ${getTrackElementClasses(
							track.type
						)} ${isSelected ? "border-foreground border-t-[0.5px] border-b-[0.5px]" : ""} ${
							isBeingDragged ? "z-50" : "z-10"
						}`}
						onClick={(e) => onElementClick?.(e, element)}
						onContextMenu={(e) => onElementMouseDown?.(e, element)}
						onMouseDown={handleElementMouseDown}
					>
						<div className="absolute inset-0 flex h-full items-center">
							{renderElementContent()}
						</div>

						{isSelected && (
							<>
								<div
									className="absolute top-0 bottom-0 left-0 z-50 w-1 cursor-w-resize bg-foreground"
									onMouseDown={(e) => handleResizeStart(e, element.id, "left")}
								/>
								<div
									className="absolute top-0 right-0 bottom-0 z-50 w-1 cursor-e-resize bg-foreground"
									onMouseDown={(e) => handleResizeStart(e, element.id, "right")}
								/>
							</>
						)}
					</div>
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={handleElementSplitContext}>
					<Scissors className="mr-2 h-4 w-4" />
					Split at playhead
				</ContextMenuItem>
				<ContextMenuItem onClick={handleElementDuplicateContext}>
					<Copy className="mr-2 h-4 w-4" />
					Duplicate {element.type === "text" ? "text" : "clip"}
				</ContextMenuItem>
				{element.type === "media" && (
					<ContextMenuItem onClick={handleReplaceClip}>
						<RefreshCw className="mr-2 h-4 w-4" />
						Replace clip
					</ContextMenuItem>
				)}
				<ContextMenuSeparator />
				<ContextMenuItem
					className="text-destructive focus:text-destructive"
					onClick={handleElementDeleteContext}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete {element.type === "text" ? "text" : "clip"}
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}
