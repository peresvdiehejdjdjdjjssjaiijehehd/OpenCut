"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useEditorActions } from "@/hooks/use-editor-actions";
import {
	useKeybindingDisabler,
	useKeybindingsListener,
} from "@/hooks/use-keybindings";
import { useEditorStore } from "@/stores/editor-store";

interface EditorProviderProps {
	children: React.ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
	const { isInitializing, isPanelsReady, initializeApp } = useEditorStore();
	const { disableKeybindings, enableKeybindings } = useKeybindingDisabler();

	// Set up action handlers
	useEditorActions();

	// Set up keybinding listener
	useKeybindingsListener();

	// Disable keybindings when initializing
	useEffect(() => {
		if (isInitializing || !isPanelsReady) {
			disableKeybindings();
		} else {
			enableKeybindings();
		}
	}, [isInitializing, isPanelsReady, disableKeybindings, enableKeybindings]);

	useEffect(() => {
		initializeApp();
	}, [initializeApp]);

	// Show loading screen while initializing
	if (isInitializing || !isPanelsReady) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-muted-foreground text-sm">Loading editor...</p>
				</div>
			</div>
		);
	}

	// App is ready, render children
	return <>{children}</>;
}
