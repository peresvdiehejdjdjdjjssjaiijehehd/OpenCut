"use client";

import { Plus } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePlaybackStore } from "@/stores/playback-store";

export interface DraggableMediaItemProps {
	name: string;
	preview: ReactNode;
	dragData: Record<string, any>;
	onDragStart?: (e: React.DragEvent) => void;
	onAddToTimeline?: (currentTime: number) => void;
	aspectRatio?: number;
	className?: string;
	showPlusOnDrag?: boolean;
	showLabel?: boolean;
	rounded?: boolean;
}

export function DraggableMediaItem({
	name,
	preview,
	dragData,
	onDragStart,
	onAddToTimeline,
	aspectRatio = 16 / 9,
	className = "",
	showPlusOnDrag = true,
	showLabel = true,
	rounded = true,
}: DraggableMediaItemProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
	const dragRef = useRef<HTMLDivElement>(null);
	const currentTime = usePlaybackStore((state) => state.currentTime);

	const handleAddToTimeline = () => {
		onAddToTimeline?.(currentTime);
	};

	const emptyImg = new window.Image();
	emptyImg.src =
		"data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

	useEffect(() => {
		if (!isDragging) return;

		const handleDragOver = (e: DragEvent) => {
			setDragPosition({ x: e.clientX, y: e.clientY });
		};

		document.addEventListener("dragover", handleDragOver);

		return () => {
			document.removeEventListener("dragover", handleDragOver);
		};
	}, [isDragging]);

	const handleDragStart = (e: React.DragEvent) => {
		e.dataTransfer.setDragImage(emptyImg, 0, 0);

		// Set drag data
		e.dataTransfer.setData(
			"application/x-media-item",
			JSON.stringify(dragData)
		);
		e.dataTransfer.effectAllowed = "copy";

		// Set initial position and show custom drag preview
		setDragPosition({ x: e.clientX, y: e.clientY });
		setIsDragging(true);

		onDragStart?.(e);
	};

	const handleDragEnd = () => {
		setIsDragging(false);
	};

	return (
		<>
			<div className="group relative h-28 w-28" ref={dragRef}>
				<div
					className={`relative flex h-auto w-full cursor-default flex-col gap-1 p-0 ${className}`}
				>
					<AspectRatio
						className={cn(
							"relative overflow-hidden bg-accent",
							rounded && "rounded-md",
							"[&::-webkit-drag-ghost]:opacity-0" // Webkit-specific ghost hiding
						)}
						draggable={true}
						onDragEnd={handleDragEnd}
						onDragStart={handleDragStart}
						ratio={aspectRatio}
					>
						{preview}
						{!isDragging && (
							<PlusButton
								className="opacity-0 group-hover:opacity-100"
								onClick={handleAddToTimeline}
							/>
						)}
					</AspectRatio>
					{showLabel && (
						<span
							aria-label={name}
							className="w-full truncate text-left text-[0.7rem] text-muted-foreground"
							title={name}
						>
							{name.length > 8
								? `${name.slice(0, 16)}...${name.slice(-3)}`
								: name}
						</span>
					)}
				</div>
			</div>

			{/* Custom drag preview */}
			{isDragging &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						className="pointer-events-none fixed z-[9999]"
						style={{
							left: dragPosition.x - 40, // Center the preview (half of 80px)
							top: dragPosition.y - 40, // Center the preview (half of 80px)
						}}
					>
						<div className="w-[80px]">
							<AspectRatio
								className="relative overflow-hidden rounded-md shadow-2xl ring ring-primary"
								ratio={1}
							>
								<div className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:rounded-none [&_img]:object-cover">
									{preview}
								</div>
								{showPlusOnDrag && (
									<PlusButton
										onClick={handleAddToTimeline}
										tooltipText="Add to timeline or drag to position"
									/>
								)}
							</AspectRatio>
						</div>
					</div>,
					document.body
				)}
		</>
	);
}

function PlusButton({
	className,
	onClick,
	tooltipText,
}: {
	className?: string;
	onClick?: () => void;
	tooltipText?: string;
}) {
	const button = (
		<Button
			className={cn("absolute right-2 bottom-2 size-4", className)}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onClick?.();
			}}
			size="icon"
			title={tooltipText}
		>
			<Plus className="!size-3" />
		</Button>
	);

	if (tooltipText) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent>
					<p>{tooltipText}</p>
				</TooltipContent>
			</Tooltip>
		);
	}

	return button;
}
