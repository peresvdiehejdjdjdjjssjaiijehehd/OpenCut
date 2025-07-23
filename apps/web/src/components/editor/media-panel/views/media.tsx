"use client";

import { Image, Loader2, Music, Plus, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MediaDragOverlay } from "@/components/editor/media-panel/drag-overlay";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DraggableMediaItem } from "@/components/ui/draggable-item";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { processMediaFiles } from "@/lib/media-processing";
import { type MediaItem, useMediaStore } from "@/stores/media-store";
import { useProjectStore } from "@/stores/project-store";
import { useTimelineStore } from "@/stores/timeline-store";

export function MediaView() {
	const { mediaItems, addMediaItem, removeMediaItem } = useMediaStore();
	const { activeProject } = useProjectStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [mediaFilter, setMediaFilter] = useState("all");

	const processFiles = async (files: FileList | File[]) => {
		if (!files || files.length === 0) return;
		if (!activeProject) {
			toast.error("No active project");
			return;
		}

		setIsProcessing(true);
		setProgress(0);
		try {
			// Process files (extract metadata, generate thumbnails, etc.)
			const processedItems = await processMediaFiles(files, (p) =>
				setProgress(p)
			);
			// Add each processed media item to the store
			for (const item of processedItems) {
				await addMediaItem(activeProject.id, item);
			}
		} catch (error) {
			// Show error toast if processing fails
			console.error("Error processing files:", error);
			toast.error("Failed to process files");
		} finally {
			setIsProcessing(false);
			setProgress(0);
		}
	};

	const { isDragOver, dragProps } = useDragDrop({
		// When files are dropped, process them
		onDrop: processFiles,
	});

	const handleFileSelect = () => fileInputRef.current?.click(); // Open file picker

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// When files are selected via file picker, process them
		if (e.target.files) processFiles(e.target.files);
		e.target.value = ""; // Reset input
	};

	const handleRemove = async (e: React.MouseEvent, id: string) => {
		// Remove a media item from the store
		e.stopPropagation();

		if (!activeProject) {
			toast.error("No active project");
			return;
		}

		// Media store now handles cascade deletion automatically
		await removeMediaItem(activeProject.id, id);
	};

	const formatDuration = (duration: number) => {
		// Format seconds as mm:ss
		const min = Math.floor(duration / 60);
		const sec = Math.floor(duration % 60);
		return `${min}:${sec.toString().padStart(2, "0")}`;
	};

	const [filteredMediaItems, setFilteredMediaItems] = useState(mediaItems);

	useEffect(() => {
		const filtered = mediaItems.filter((item) => {
			if (mediaFilter && mediaFilter !== "all" && item.type !== mediaFilter) {
				return false;
			}

			if (
				searchQuery &&
				!item.name.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}

			return true;
		});

		setFilteredMediaItems(filtered);
	}, [mediaItems, mediaFilter, searchQuery]);

	const renderPreview = (item: MediaItem) => {
		// Render a preview for each media type (image, video, audio, unknown)
		if (item.type === "image") {
			return (
				<div className="flex h-full w-full items-center justify-center">
					<img
						alt={item.name}
						className="max-h-full max-w-full object-contain"
						loading="lazy"
						src={item.url}
					/>
				</div>
			);
		}

		if (item.type === "video") {
			if (item.thumbnailUrl) {
				return (
					<div className="relative h-full w-full">
						<img
							alt={item.name}
							className="h-full w-full rounded object-cover"
							loading="lazy"
							src={item.thumbnailUrl}
						/>
						<div className="absolute inset-0 flex items-center justify-center rounded bg-black/20">
							<Video className="h-6 w-6 text-white drop-shadow-md" />
						</div>
						{item.duration && (
							<div className="absolute right-1 bottom-1 rounded bg-black/70 px-1 text-white text-xs">
								{formatDuration(item.duration)}
							</div>
						)}
					</div>
				);
			}
			return (
				<div className="flex h-full w-full flex-col items-center justify-center rounded bg-muted/30 text-muted-foreground">
					<Video className="mb-1 h-6 w-6" />
					<span className="text-xs">Video</span>
					{item.duration && (
						<span className="text-xs opacity-70">
							{formatDuration(item.duration)}
						</span>
					)}
				</div>
			);
		}

		if (item.type === "audio") {
			return (
				<div className="flex h-full w-full flex-col items-center justify-center rounded border border-green-500/20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-muted-foreground">
					<Music className="mb-1 h-6 w-6" />
					<span className="text-xs">Audio</span>
					{item.duration && (
						<span className="text-xs opacity-70">
							{formatDuration(item.duration)}
						</span>
					)}
				</div>
			);
		}

		return (
			<div className="flex h-full w-full flex-col items-center justify-center rounded bg-muted/30 text-muted-foreground">
				<Image className="h-6 w-6" />
				<span className="mt-1 text-xs">Unknown</span>
			</div>
		);
	};

	return (
		<>
			{/* Hidden file input for uploading media */}
			<input
				accept="image/*,video/*,audio/*"
				className="hidden"
				multiple
				onChange={handleFileChange}
				ref={fileInputRef}
				type="file"
			/>

			<div
				className={`relative flex h-full flex-col gap-1 transition-colors ${isDragOver ? "bg-accent/30" : ""}`}
				{...dragProps}
			>
				<div className="p-3 pb-2">
					{/* Search and filter controls */}
					<div className="flex gap-2">
						<Select onValueChange={setMediaFilter} value={mediaFilter}>
							<SelectTrigger className="h-9 w-[80px] text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="video">Video</SelectItem>
								<SelectItem value="audio">Audio</SelectItem>
								<SelectItem value="image">Image</SelectItem>
							</SelectContent>
						</Select>
						<Input
							className="h-9 min-w-[60px] flex-1 text-xs"
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search media..."
							type="text"
							value={searchQuery}
						/>
						<Button
							className="h-9 min-w-[30px] flex-none items-center justify-center overflow-hidden whitespace-nowrap bg-transparent px-2"
							disabled={isProcessing}
							onClick={handleFileSelect}
							size="lg"
							variant="outline"
						>
							{isProcessing ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Plus className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-3 pt-0">
					{isDragOver || filteredMediaItems.length === 0 ? (
						<MediaDragOverlay
							isEmptyState={filteredMediaItems.length === 0 && !isDragOver}
							isProcessing={isProcessing}
							isVisible={true}
							onClick={handleFileSelect}
							progress={progress}
						/>
					) : (
						<div
							className="grid gap-2"
							style={{
								gridTemplateColumns: "repeat(auto-fill, 160px)",
							}}
						>
							{/* Render each media item as a draggable button */}
							{filteredMediaItems.map((item) => (
								<ContextMenu key={item.id}>
									<ContextMenuTrigger>
										<DraggableMediaItem
											dragData={{
												id: item.id,
												type: item.type,
												name: item.name,
											}}
											name={item.name}
											onAddToTimeline={(currentTime) =>
												useTimelineStore
													.getState()
													.addMediaAtTime(item, currentTime)
											}
											preview={renderPreview(item)}
											rounded={false}
											showPlusOnDrag={false}
										/>
									</ContextMenuTrigger>
									<ContextMenuContent>
										<ContextMenuItem>Export clips</ContextMenuItem>
										<ContextMenuItem
											onClick={(e) => handleRemove(e, item.id)}
											variant="destructive"
										>
											Delete
										</ContextMenuItem>
									</ContextMenuContent>
								</ContextMenu>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}
