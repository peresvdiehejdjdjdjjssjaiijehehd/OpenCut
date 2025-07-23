import { Image, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaDragOverlayProps {
	isVisible: boolean;
	isProcessing?: boolean;
	progress?: number;
	onClick?: () => void;
	isEmptyState?: boolean;
}

export function MediaDragOverlay({
	isVisible,
	isProcessing = false,
	progress = 0,
	onClick,
	isEmptyState = false,
}: MediaDragOverlayProps) {
	if (!isVisible) return null;

	const handleClick = (e: React.MouseEvent) => {
		if (isProcessing || !onClick) return;
		e.preventDefault();
		e.stopPropagation();
		onClick();
	};

	return (
		<div
			className="flex h-full flex-col items-center justify-center gap-4 rounded-lg bg-foreground/5 p-8 text-center transition-all duration-200 hover:bg-foreground/10"
			onClick={handleClick}
		>
			<div className="flex items-center justify-center">
				<Upload className="h-10 w-10 text-foreground" />
			</div>

			<div className="space-y-2">
				<p className="max-w-sm text-muted-foreground text-xs">
					{isProcessing
						? `Processing your files (${progress}%)`
						: "Drag and drop videos, photos, and audio files here"}
				</p>
			</div>

			{isProcessing && (
				<div className="w-full max-w-xs">
					<div className="h-2 w-full rounded-full bg-muted/50">
						<div
							className="h-2 rounded-full bg-primary transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
