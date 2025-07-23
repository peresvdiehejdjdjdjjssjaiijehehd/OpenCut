"use client";

import { ChevronLeft, Download } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatTimeCode } from "@/lib/time";
import { useProjectStore } from "@/stores/project-store";
import { useTimelineStore } from "@/stores/timeline-store";
import { HeaderBase } from "./header-base";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";
import { Button } from "./ui/button";

export function EditorHeader() {
	const { getTotalDuration } = useTimelineStore();
	const { activeProject, renameProject } = useProjectStore();
	const [isEditing, setIsEditing] = useState(false);
	const [newName, setNewName] = useState(activeProject?.name || "");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleExport = () => {};

	const handleNameClick = () => {
		if (!activeProject) {
			return;
		}
		setNewName(activeProject.name);
		setIsEditing(true);
	};

	const handleNameSave = async () => {
		if (activeProject && newName.trim() && newName !== activeProject.name) {
			try {
				await renameProject(activeProject.id, newName.trim());
			} catch (_error) {
				setNewName(activeProject.name);
			}
		}
		setIsEditing(false);
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleNameSave();
		} else if (e.key === "Escape") {
			setIsEditing(false);
		}
	};

	const leftContent = (
		<div className="flex items-center gap-2">
			<Link
				className="flex items-center gap-2 font-medium tracking-tight transition-opacity hover:opacity-80"
				href="/projects"
			>
				<ChevronLeft className="h-4 w-4" />
			</Link>
			<div className="flex h-9 w-[14rem] items-center">
				{isEditing ? (
					<Input
						aria-label="Project name"
						autoFocus
						className="h-9 truncate px-2 py-1 font-medium text-sm"
						maxLength={64}
						onBlur={handleNameSave}
						onChange={(e) => setNewName(e.target.value)}
						onFocus={(e) => e.target.select()}
						onKeyDown={handleInputKeyDown}
						ref={inputRef}
						value={newName}
					/>
				) : (
					<span
						className="cursor-pointer font-medium text-sm hover:underline"
						onClick={handleNameClick}
						onKeyDown={(e) => e.key === "Enter" && handleNameClick()}
						role="button"
						tabIndex={0}
						title="Click to rename"
					>
						<div className="w-40 overflow-clip truncate text-ellipsis">
							{activeProject?.name}
						</div>
					</span>
				)}
			</div>
		</div>
	);

	const centerContent = (
		<div className="flex items-center gap-2 text-xs">
			<span>
				{formatTimeCode(
					getTotalDuration(),
					"HH:MM:SS:FF",
					activeProject?.fps || 30
				)}
			</span>
		</div>
	);

	const rightContent = (
		<nav className="flex items-center gap-2">
			<KeyboardShortcutsHelp />
			<Button
				className="h-7 text-xs"
				onClick={handleExport}
				size="sm"
				variant="primary"
			>
				<Download className="h-4 w-4" />
				<span className="text-sm">Export</span>
			</Button>
		</nav>
	);

	return (
		<HeaderBase
			centerContent={centerContent}
			className="h-[3.2rem] items-center bg-background px-4"
			leftContent={leftContent}
			rightContent={rightContent}
		/>
	);
}
