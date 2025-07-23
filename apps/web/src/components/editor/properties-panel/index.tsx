"use client";

import { FPS_PRESETS } from "@/constants/timeline-constants";
import { useAspectRatio } from "@/hooks/use-aspect-ratio";
import { useMediaStore } from "@/stores/media-store";
import { useProjectStore } from "@/stores/project-store";
import { useTimelineStore } from "@/stores/timeline-store";
import { Label } from "../../ui/label";
import { ScrollArea } from "../../ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { AudioProperties } from "./audio-properties";
import { MediaProperties } from "./media-properties";
import { TextProperties } from "./text-properties";

export function PropertiesPanel() {
	const { activeProject, updateProjectFps } = useProjectStore();
	const { getDisplayName, canvasSize } = useAspectRatio();
	const { selectedElements, tracks } = useTimelineStore();
	const { mediaItems } = useMediaStore();

	const handleFpsChange = (value: string) => {
		const fps = Number.parseFloat(value);
		if (!Number.isNaN(fps) && fps > 0) {
			updateProjectFps(fps);
		}
	};

	const emptyView = (
		<div className="space-y-4 p-5">
			{/* Media Properties */}
			<div className="flex flex-col gap-3">
				<PropertyItem label="Name:" value={activeProject?.name || ""} />
				<PropertyItem label="Aspect ratio:" value={getDisplayName()} />
				<PropertyItem
					label="Resolution:"
					value={`${canvasSize.width} × ${canvasSize.height}`}
				/>
				<div className="flex items-center justify-between">
					<Label className="text-muted-foreground text-xs">Frame rate:</Label>
					<Select
						onValueChange={handleFpsChange}
						value={(activeProject?.fps || 30).toString()}
					>
						<SelectTrigger className="h-6 w-32 text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{FPS_PRESETS.map(({ value, label }) => (
								<SelectItem className="text-xs" key={value} value={value}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);

	return (
		<ScrollArea className="h-full rounded-sm bg-panel">
			{selectedElements.length > 0
				? selectedElements.map(({ trackId, elementId }) => {
						const track = tracks.find((t) => t.id === trackId);
						const element = track?.elements.find((e) => e.id === elementId);

						if (element?.type === "text") {
							return (
								<div key={elementId}>
									<TextProperties element={element} trackId={trackId} />
								</div>
							);
						}
						if (element?.type === "media") {
							const mediaItem = mediaItems.find(
								(item) => item.id === element.mediaId
							);

							if (mediaItem?.type === "audio") {
								return <AudioProperties element={element} />;
							}

							return (
								<div key={elementId}>
									<MediaProperties element={element} />
								</div>
							);
						}
						return null;
					})
				: emptyView}
		</ScrollArea>
	);
}

function PropertyItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between">
			<Label className="text-muted-foreground text-xs">{label}</Label>
			<span className="w-40 truncate text-right text-xs" title={value}>
				{value}
			</span>
		</div>
	);
}
