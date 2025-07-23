import { DraggableMediaItem } from "@/components/ui/draggable-item";
import { TIMELINE_CONSTANTS } from "@/constants/timeline-constants";
import { useTimelineStore } from "@/stores/timeline-store";
import type { TextElement } from "@/types/timeline";

const textData: TextElement = {
	id: "default-text",
	type: "text",
	name: "Default text",
	content: "Default text",
	fontSize: 48,
	fontFamily: "Arial",
	color: "#ffffff",
	backgroundColor: "transparent",
	textAlign: "center" as const,
	fontWeight: "normal" as const,
	fontStyle: "normal" as const,
	textDecoration: "none" as const,
	x: 0,
	y: 0,
	rotation: 0,
	opacity: 1,
	duration: TIMELINE_CONSTANTS.DEFAULT_TEXT_DURATION,
	startTime: 0,
	trimStart: 0,
	trimEnd: 0,
};

export function TextView() {
	return (
		<div className="p-4">
			<DraggableMediaItem
				aspectRatio={1}
				dragData={{
					id: textData.id,
					type: textData.type,
					name: textData.name,
					content: textData.content,
				}}
				name="Default text"
				onAddToTimeline={(currentTime) =>
					useTimelineStore.getState().addTextAtTime(textData, currentTime)
				}
				preview={
					<div className="flex h-full w-full items-center justify-center rounded bg-accent">
						<span className="select-none text-xs">Default text</span>
					</div>
				}
				showLabel={false}
			/>
		</div>
	);
}
