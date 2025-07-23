import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function RenameProjectDialog({
	isOpen,
	onOpenChange,
	onConfirm,
	projectName,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (name: string) => void;
	projectName: string;
}) {
	const [name, setName] = useState(projectName);

	// Reset the name when dialog opens - this is better UX than syncing with every prop change
	const handleOpenChange = (open: boolean) => {
		if (open) {
			setName(projectName);
		}
		onOpenChange(open);
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={isOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename Project</DialogTitle>
					<DialogDescription>
						Enter a new name for your project.
					</DialogDescription>
				</DialogHeader>

				<Input
					className="mt-4"
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							onConfirm(name);
						}
					}}
					placeholder="Enter a new name"
					value={name}
				/>

				<DialogFooter>
					<Button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onOpenChange(false);
						}}
						variant="outline"
					>
						Cancel
					</Button>
					<Button onClick={() => onConfirm(name)}>Rename</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
