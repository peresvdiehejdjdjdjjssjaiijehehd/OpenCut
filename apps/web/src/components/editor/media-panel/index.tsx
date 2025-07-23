"use client";

import { type Tab, useMediaPanelStore } from "./store";
import { TabBar } from "./tabbar";
import { AudioView } from "./views/audio";
import { MediaView } from "./views/media";
import { TextView } from "./views/text";

export function MediaPanel() {
	const { activeTab } = useMediaPanelStore();

	const viewMap: Record<Tab, React.ReactNode> = {
		media: <MediaView />,
		audio: <AudioView />,
		text: <TextView />,
		stickers: (
			<div className="p-4 text-muted-foreground">
				Stickers view coming soon...
			</div>
		),
		effects: (
			<div className="p-4 text-muted-foreground">
				Effects view coming soon...
			</div>
		),
		transitions: (
			<div className="p-4 text-muted-foreground">
				Transitions view coming soon...
			</div>
		),
		captions: (
			<div className="p-4 text-muted-foreground">
				Captions view coming soon...
			</div>
		),
		filters: (
			<div className="p-4 text-muted-foreground">
				Filters view coming soon...
			</div>
		),
		adjustment: (
			<div className="p-4 text-muted-foreground">
				Adjustment view coming soon...
			</div>
		),
	};

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-sm bg-panel">
			<TabBar />
			<div className="flex-1">{viewMap[activeTab]}</div>
		</div>
	);
}
