"use client";

import { Expand, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VideoPlayer } from "@/components/ui/video-player";
import { useAspectRatio } from "@/hooks/use-aspect-ratio";
import { FONT_CLASS_MAP } from "@/lib/font-config";
import { formatTimeCode } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { type MediaItem, useMediaStore } from "@/stores/media-store";
import { usePlaybackStore } from "@/stores/playback-store";
import { useProjectStore } from "@/stores/project-store";
import { useTimelineStore } from "@/stores/timeline-store";
import type { TimelineElement, TimelineTrack } from "@/types/timeline";
import { BackgroundSettings } from "../background-settings";

interface ActiveElement {
	element: TimelineElement;
	track: TimelineTrack;
	mediaItem: MediaItem | null;
}

export function PreviewPanel() {
	const { tracks, getTotalDuration } = useTimelineStore();
	const { mediaItems } = useMediaStore();
	const { currentTime, toggle, setCurrentTime, isPlaying } = usePlaybackStore();
	const { canvasSize } = useEditorStore();
	const previewRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [previewDimensions, setPreviewDimensions] = useState({
		width: 0,
		height: 0,
	});
	const [isExpanded, setIsExpanded] = useState(false);
	const { activeProject } = useProjectStore();

	useEffect(() => {
		const updatePreviewSize = () => {
			if (!containerRef.current) {
				return;
			}

			let availableWidth, availableHeight;

			if (isExpanded) {
				const controlsHeight = 80;
				const marginSpace = 24;
				availableWidth = window.innerWidth - marginSpace;
				availableHeight = window.innerHeight - controlsHeight - marginSpace;
			} else {
				const container = containerRef.current.getBoundingClientRect();
				const computedStyle = getComputedStyle(containerRef.current);
				const paddingTop = Number.parseFloat(computedStyle.paddingTop);
				const paddingBottom = Number.parseFloat(computedStyle.paddingBottom);
				const paddingLeft = Number.parseFloat(computedStyle.paddingLeft);
				const paddingRight = Number.parseFloat(computedStyle.paddingRight);
				const gap = Number.parseFloat(computedStyle.gap) || 16;
				const toolbar = containerRef.current.querySelector("[data-toolbar]");
				const toolbarHeight = toolbar
					? toolbar.getBoundingClientRect().height
					: 0;

				availableWidth = container.width - paddingLeft - paddingRight;
				availableHeight =
					container.height -
					paddingTop -
					paddingBottom -
					toolbarHeight -
					(toolbarHeight > 0 ? gap : 0);
			}

			const targetRatio = canvasSize.width / canvasSize.height;
			const containerRatio = availableWidth / availableHeight;
			let width, height;

			if (containerRatio > targetRatio) {
				height = availableHeight * (isExpanded ? 0.95 : 1);
				width = height * targetRatio;
			} else {
				width = availableWidth * (isExpanded ? 0.95 : 1);
				height = width / targetRatio;
			}

			setPreviewDimensions({ width, height });
		};

		updatePreviewSize();
		const resizeObserver = new ResizeObserver(updatePreviewSize);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}
		if (isExpanded) {
			window.addEventListener("resize", updatePreviewSize);
		}

		return () => {
			resizeObserver.disconnect();
			if (isExpanded) {
				window.removeEventListener("resize", updatePreviewSize);
			}
		};
	}, [canvasSize.width, canvasSize.height, isExpanded]);

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

	const toggleExpanded = useCallback(() => {
		setIsExpanded((prev) => !prev);
	}, []);

	const hasAnyElements = tracks.some((track) => track.elements.length > 0);
	const getActiveElements = (): ActiveElement[] => {
		const activeElements: ActiveElement[] = [];

		tracks.forEach((track) => {
			track.elements.forEach((element) => {
				const elementStart = element.startTime;
				const elementEnd =
					element.startTime +
					(element.duration - element.trimStart - element.trimEnd);

				if (currentTime >= elementStart && currentTime < elementEnd) {
					let mediaItem = null;
					if (element.type === "media") {
						mediaItem =
							element.mediaId === "test"
								? null
								: mediaItems.find((item) => item.id === element.mediaId) ||
									null;
					}
					activeElements.push({ element, track, mediaItem });
				}
			});
		});

		return activeElements;
	};

	const activeElements = getActiveElements();

	// Get media elements for blur background (video/image only)
	const getBlurBackgroundElements = (): ActiveElement[] => {
		return activeElements.filter(
			({ element, mediaItem }) =>
				element.type === "media" &&
				mediaItem &&
				(mediaItem.type === "video" || mediaItem.type === "image") &&
				element.mediaId !== "test" // Exclude test elements
		);
	};

	const blurBackgroundElements = getBlurBackgroundElements();

	// Render blur background layer
	const renderBlurBackground = () => {
		if (
			!activeProject?.backgroundType ||
			activeProject.backgroundType !== "blur" ||
			blurBackgroundElements.length === 0
		) {
			return null;
		}

		// Use the first media element for background (could be enhanced to use primary/focused element)
		const backgroundElement = blurBackgroundElements[0];
		const { element, mediaItem } = backgroundElement;

		if (!mediaItem) {
			return null;
		}

		const blurIntensity = activeProject.blurIntensity || 8;

		if (mediaItem.type === "video") {
			return (
				<div
					className="absolute inset-0 overflow-hidden"
					key={`blur-${element.id}`}
					style={{
						filter: `blur(${blurIntensity}px)`,
						transform: "scale(1.1)", // Slightly zoom to avoid blur edge artifacts
						transformOrigin: "center",
					}}
				>
					<VideoPlayer
						className="h-full w-full object-cover"
						clipDuration={element.duration}
						clipStartTime={element.startTime}
						poster={mediaItem.thumbnailUrl}
						src={mediaItem.url!}
						trimEnd={element.trimEnd}
						trimStart={element.trimStart}
					/>
				</div>
			);
		}

		if (mediaItem.type === "image") {
			return (
				<div
					className="absolute inset-0 overflow-hidden"
					key={`blur-${element.id}`}
					style={{
						filter: `blur(${blurIntensity}px)`,
						transform: "scale(1.1)", // Slightly zoom to avoid blur edge artifacts
						transformOrigin: "center",
					}}
				>
					<img
						alt={mediaItem.name}
						className="h-full w-full object-cover"
						draggable={false}
						src={mediaItem.url!}
					/>
				</div>
			);
		}

		return null;
	};

	// Render an element
	const renderElement = (elementData: ActiveElement, index: number) => {
		const { element, mediaItem } = elementData;

		// Text elements
		if (element.type === "text") {
			const fontClassName =
				FONT_CLASS_MAP[element.fontFamily as keyof typeof FONT_CLASS_MAP] || "";

			const scaleRatio = previewDimensions.width / canvasSize.width;

			return (
				<div
					className="absolute flex items-center justify-center"
					key={element.id}
					style={{
						left: `${50 + (element.x / canvasSize.width) * 100}%`,
						top: `${50 + (element.y / canvasSize.height) * 100}%`,
						transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scale(${scaleRatio})`,
						opacity: element.opacity,
						zIndex: 100 + index, // Text elements on top
					}}
				>
					<div
						className={fontClassName}
						style={{
							fontSize: `${element.fontSize}px`,
							color: element.color,
							backgroundColor: element.backgroundColor,
							textAlign: element.textAlign,
							fontWeight: element.fontWeight,
							fontStyle: element.fontStyle,
							textDecoration: element.textDecoration,
							padding: "4px 8px",
							borderRadius: "2px",
							whiteSpace: "nowrap",
							// Fallback for system fonts that don't have classes
							...(fontClassName === "" && { fontFamily: element.fontFamily }),
						}}
					>
						{element.content}
					</div>
				</div>
			);
		}

		// Media elements
		if (element.type === "media") {
			// Test elements
			if (!mediaItem || element.mediaId === "test") {
				return (
					<div
						className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20"
						key={element.id}
					>
						<div className="text-center">
							<div className="mb-2 text-2xl">🎬</div>
							<p className="text-white text-xs">{element.name}</p>
						</div>
					</div>
				);
			}

			// Video elements
			if (mediaItem.type === "video") {
				return (
					<div
						className="absolute inset-0 flex items-center justify-center"
						key={element.id}
					>
						<VideoPlayer
							clipDuration={element.duration}
							clipStartTime={element.startTime}
							poster={mediaItem.thumbnailUrl}
							src={mediaItem.url!}
							trimEnd={element.trimEnd}
							trimStart={element.trimStart}
						/>
					</div>
				);
			}

			// Image elements
			if (mediaItem.type === "image") {
				return (
					<div
						className="absolute inset-0 flex items-center justify-center"
						key={element.id}
					>
						<img
							alt={mediaItem.name}
							className="max-h-full max-w-full object-contain"
							draggable={false}
							src={mediaItem.url!}
						/>
					</div>
				);
			}

			// Audio elements (no visual representation)
			if (mediaItem.type === "audio") {
				return (
					<div className="absolute inset-0" key={element.id}>
						<AudioPlayer
							clipDuration={element.duration}
							clipStartTime={element.startTime}
							src={mediaItem.url!}
							trackMuted={elementData.track.muted}
							trimEnd={element.trimEnd}
							trimStart={element.trimStart}
						/>
					</div>
				);
			}
		}

		return null;
	};

	return (
		<>
			<div className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-sm bg-panel">
				<div
					className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center p-3"
					ref={containerRef}
				>
					<div className="flex-1" />
					{hasAnyElements ? (
						<div
							className="relative overflow-hidden border"
							ref={previewRef}
							style={{
								width: previewDimensions.width,
								height: previewDimensions.height,
								backgroundColor:
									activeProject?.backgroundType === "blur"
										? "transparent"
										: activeProject?.backgroundColor || "#000000",
							}}
						>
							{renderBlurBackground()}
							{activeElements.length === 0 ? (
								<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
									No elements at current time
								</div>
							) : (
								activeElements.map((elementData, index) =>
									renderElement(elementData, index)
								)
							)}
							{activeProject?.backgroundType === "blur" &&
								blurBackgroundElements.length === 0 &&
								activeElements.length > 0 && (
									<div className="absolute right-2 bottom-2 left-2 rounded bg-black/70 p-2 text-white text-xs">
										Add a video or image to use blur background
									</div>
								)}
						</div>
					) : null}

					<div className="flex-1" />

					<PreviewToolbar
						currentTime={currentTime}
						getTotalDuration={getTotalDuration}
						hasAnyElements={hasAnyElements}
						isExpanded={isExpanded}
						onToggleExpanded={toggleExpanded}
						setCurrentTime={setCurrentTime}
						toggle={toggle}
					/>
				</div>
			</div>

			{isExpanded && (
				<FullscreenPreview
					activeElements={activeElements}
					activeProject={activeProject}
					blurBackgroundElements={blurBackgroundElements}
					currentTime={currentTime}
					getTotalDuration={getTotalDuration}
					hasAnyElements={hasAnyElements}
					previewDimensions={previewDimensions}
					renderBlurBackground={renderBlurBackground}
					renderElement={renderElement}
					setCurrentTime={setCurrentTime}
					toggle={toggle}
					toggleExpanded={toggleExpanded}
				/>
			)}
		</>
	);
}

function FullscreenToolbar({
	hasAnyElements,
	onToggleExpanded,
	currentTime,
	setCurrentTime,
	toggle,
	getTotalDuration,
}: {
	hasAnyElements: boolean;
	onToggleExpanded: () => void;
	currentTime: number;
	setCurrentTime: (time: number) => void;
	toggle: () => void;
	getTotalDuration: () => number;
}) {
	const { isPlaying } = usePlaybackStore();
	const { activeProject } = useProjectStore();
	const [isDragging, setIsDragging] = useState(false);

	const totalDuration = getTotalDuration();
	const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

	const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!hasAnyElements) {
			return;
		}
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const percentage = Math.max(0, Math.min(1, clickX / rect.width));
		const newTime = percentage * totalDuration;
		setCurrentTime(Math.max(0, Math.min(newTime, totalDuration)));
	};

	const handleTimelineDrag = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!hasAnyElements) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		setIsDragging(true);

		const handleMouseMove = (moveEvent: MouseEvent) => {
			moveEvent.preventDefault();
			const dragX = moveEvent.clientX - rect.left;
			const percentage = Math.max(0, Math.min(1, dragX / rect.width));
			const newTime = percentage * totalDuration;
			setCurrentTime(Math.max(0, Math.min(newTime, totalDuration)));
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.userSelect = "";
		};

		document.body.style.userSelect = "none";
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		handleMouseMove(e.nativeEvent);
	};

	const skipBackward = () => {
		const newTime = Math.max(0, currentTime - 1);
		setCurrentTime(newTime);
	};

	const skipForward = () => {
		const newTime = Math.min(totalDuration, currentTime + 1);
		setCurrentTime(newTime);
	};

	return (
		<div
			className="flex w-full items-center gap-2 p-1 pt-2 text-white"
			data-toolbar
		>
			<div className="flex items-center gap-1 text-[0.70rem] text-white/90 tabular-nums">
				<span className="text-primary">
					{formatTimeCode(currentTime, "HH:MM:SS:FF", activeProject?.fps || 30)}
				</span>
				<span className="opacity-50">/</span>
				<span>
					{formatTimeCode(
						totalDuration,
						"HH:MM:SS:FF",
						activeProject?.fps || 30
					)}
				</span>
			</div>

			<div className="flex items-center gap-1">
				<Button
					className="h-auto p-0 text-white hover:text-white/80"
					disabled={!hasAnyElements}
					onClick={skipBackward}
					size="icon"
					title="Skip backward 1s"
					variant="text"
				>
					<SkipBack className="h-3 w-3" />
				</Button>
				<Button
					className="h-auto p-0 text-white hover:text-white/80"
					disabled={!hasAnyElements}
					onClick={toggle}
					size="icon"
					variant="text"
				>
					{isPlaying ? (
						<Pause className="h-3 w-3" />
					) : (
						<Play className="h-3 w-3" />
					)}
				</Button>
				<Button
					className="h-auto p-0 text-white hover:text-white/80"
					disabled={!hasAnyElements}
					onClick={skipForward}
					size="icon"
					title="Skip forward 1s"
					variant="text"
				>
					<SkipForward className="h-3 w-3" />
				</Button>
			</div>

			<div className="flex flex-1 items-center gap-2">
				<div
					className={cn(
						"relative h-1 flex-1 cursor-pointer rounded-full bg-white/20",
						!hasAnyElements && "cursor-not-allowed opacity-50"
					)}
					onClick={hasAnyElements ? handleTimelineClick : undefined}
					onMouseDown={hasAnyElements ? handleTimelineDrag : undefined}
					style={{ userSelect: "none" }}
				>
					<div
						className={cn(
							"absolute top-0 left-0 h-full rounded-full bg-white",
							!isDragging && "duration-100"
						)}
						style={{ width: `${progress}%` }}
					/>
					<div
						className="-translate-y-1/2 -translate-x-1/2 absolute top-1/2 h-3 w-3 rounded-full border border-black/20 bg-white shadow-sm"
						style={{ left: `${progress}%` }}
					/>
				</div>
			</div>

			<Button
				className="!size-4 text-white/80 hover:text-white"
				onClick={onToggleExpanded}
				size="icon"
				title="Exit fullscreen (Esc)"
				variant="text"
			>
				<Expand className="!size-4" />
			</Button>
		</div>
	);
}

function FullscreenPreview({
	previewDimensions,
	activeProject,
	renderBlurBackground,
	activeElements,
	renderElement,
	blurBackgroundElements,
	hasAnyElements,
	toggleExpanded,
	currentTime,
	setCurrentTime,
	toggle,
	getTotalDuration,
}: {
	previewDimensions: { width: number; height: number };
	activeProject: any;
	renderBlurBackground: () => React.ReactNode;
	activeElements: ActiveElement[];
	renderElement: (elementData: ActiveElement, index: number) => React.ReactNode;
	blurBackgroundElements: ActiveElement[];
	hasAnyElements: boolean;
	toggleExpanded: () => void;
	currentTime: number;
	setCurrentTime: (time: number) => void;
	toggle: () => void;
	getTotalDuration: () => number;
}) {
	return (
		<div className="fixed inset-0 z-[9999] flex flex-col">
			<div className="flex flex-1 items-center justify-center bg-background">
				<div
					className="relative m-3 overflow-hidden border border-border"
					style={{
						width: previewDimensions.width,
						height: previewDimensions.height,
						backgroundColor:
							activeProject?.backgroundType === "blur"
								? "#1a1a1a"
								: activeProject?.backgroundColor || "#1a1a1a",
					}}
				>
					{renderBlurBackground()}
					{activeElements.length === 0 ? (
						<div className="absolute inset-0 flex items-center justify-center text-white/60">
							No elements at current time
						</div>
					) : (
						activeElements.map((elementData, index) =>
							renderElement(elementData, index)
						)
					)}
					{activeProject?.backgroundType === "blur" &&
						blurBackgroundElements.length === 0 &&
						activeElements.length > 0 && (
							<div className="absolute right-2 bottom-2 left-2 rounded bg-black/70 p-2 text-white text-xs">
								Add a video or image to use blur background
							</div>
						)}
				</div>
			</div>
			<div className="bg-black p-4">
				<FullscreenToolbar
					currentTime={currentTime}
					getTotalDuration={getTotalDuration}
					hasAnyElements={hasAnyElements}
					onToggleExpanded={toggleExpanded}
					setCurrentTime={setCurrentTime}
					toggle={toggle}
				/>
			</div>
		</div>
	);
}

function PreviewToolbar({
	hasAnyElements,
	onToggleExpanded,
	isExpanded,
	currentTime,
	setCurrentTime,
	toggle,
	getTotalDuration,
}: {
	hasAnyElements: boolean;
	onToggleExpanded: () => void;
	isExpanded: boolean;
	currentTime: number;
	setCurrentTime: (time: number) => void;
	toggle: () => void;
	getTotalDuration: () => number;
}) {
	const { isPlaying } = usePlaybackStore();
	const { setCanvasSize, setCanvasSizeToOriginal } = useEditorStore();
	const { activeProject } = useProjectStore();
	const {
		currentPreset,
		isOriginal,
		getOriginalAspectRatio,
		getDisplayName,
		canvasPresets,
	} = useAspectRatio();

	const handlePresetSelect = (preset: { width: number; height: number }) => {
		setCanvasSize({ width: preset.width, height: preset.height });
	};

	const handleOriginalSelect = () => {
		const aspectRatio = getOriginalAspectRatio();
		setCanvasSizeToOriginal(aspectRatio);
	};

	if (isExpanded) {
		return (
			<FullscreenToolbar
				{...{
					hasAnyElements,
					onToggleExpanded,
					currentTime,
					setCurrentTime,
					toggle,
					getTotalDuration,
				}}
			/>
		);
	}

	return (
		<div
			className="flex w-full items-end justify-between gap-2 p-1 pt-2"
			data-toolbar
		>
			<div>
				<p
					className={cn(
						"flex items-center gap-1 text-[0.75rem] text-muted-foreground",
						!hasAnyElements && "opacity-50"
					)}
				>
					<span className="text-primary tabular-nums">
						{formatTimeCode(
							currentTime,
							"HH:MM:SS:FF",
							activeProject?.fps || 30
						)}
					</span>
					<span className="opacity-50">/</span>
					<span className="tabular-nums">
						{formatTimeCode(
							getTotalDuration(),
							"HH:MM:SS:FF",
							activeProject?.fps || 30
						)}
					</span>
				</p>
			</div>
			<Button
				className="h-auto p-0"
				disabled={!hasAnyElements}
				onClick={toggle}
				size="icon"
				variant="text"
			>
				{isPlaying ? (
					<Pause className="h-3 w-3" />
				) : (
					<Play className="h-3 w-3" />
				)}
			</Button>
			<div className="flex items-center gap-3">
				<BackgroundSettings />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							className="!bg-panel-accent h-4 rounded-none border border-muted-foreground px-0.5 py-0 font-light text-[0.70rem] text-foreground/85"
							disabled={!hasAnyElements}
							size="sm"
						>
							{getDisplayName()}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							className={cn("text-xs", isOriginal && "font-semibold")}
							onClick={handleOriginalSelect}
						>
							Original
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{canvasPresets.map((preset) => (
							<DropdownMenuItem
								className={cn(
									"text-xs",
									currentPreset?.name === preset.name && "font-semibold"
								)}
								key={preset.name}
								onClick={() => handlePresetSelect(preset)}
							>
								{preset.name}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<Button
					className="!size-4 text-muted-foreground"
					onClick={onToggleExpanded}
					size="icon"
					title="Enter fullscreen"
					variant="text"
				>
					<Expand className="!size-4" />
				</Button>
			</div>
		</div>
	);
}
