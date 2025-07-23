"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { EditorHeader } from "@/components/editor-header";
import { EditorProvider } from "@/components/editor-provider";
import { Onboarding } from "@/components/onboarding";
import { usePlaybackControls } from "@/hooks/use-playback-controls";
import { usePanelStore } from "@/stores/panel-store";
import { useProjectStore } from "@/stores/project-store";
import { MediaPanel } from "../../../components/editor/media-panel";
import { PreviewPanel } from "../../../components/editor/preview-panel";
import { PropertiesPanel } from "../../../components/editor/properties-panel";
import { Timeline } from "../../../components/editor/timeline";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "../../../components/ui/resizable";

export default function Editor() {
	const {
		toolsPanel,
		previewPanel,
		mainContent,
		timeline,
		setToolsPanel,
		setPreviewPanel,
		setMainContent,
		setTimeline,
		propertiesPanel,
		setPropertiesPanel,
	} = usePanelStore();

	const { activeProject, loadProject, createNewProject } = useProjectStore();
	const params = useParams();
	const router = useRouter();
	const projectId = params.project_id as string;
	const handledProjectIds = useRef<Set<string>>(new Set());

	usePlaybackControls();

	useEffect(() => {
		const initProject = async () => {
			if (!projectId) {
				return;
			}

			if (activeProject?.id === projectId) {
				return;
			}

			if (handledProjectIds.current.has(projectId)) {
				return;
			}

			try {
				await loadProject(projectId);
			} catch (_error) {
				handledProjectIds.current.add(projectId);

				const newProjectId = await createNewProject("Untitled Project");
				router.replace(`/editor/${newProjectId}`);
				return;
			}
		};

		initProject();
	}, [projectId, activeProject?.id, loadProject, createNewProject, router]);

	return (
		<EditorProvider>
			<div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
				<EditorHeader />
				<div className="min-h-0 min-w-0 flex-1">
					<ResizablePanelGroup
						className="h-full w-full gap-[0.18rem]"
						direction="vertical"
					>
						<ResizablePanel
							className="min-h-0"
							defaultSize={mainContent}
							maxSize={85}
							minSize={30}
							onResize={setMainContent}
						>
							{/* Main content area */}
							<ResizablePanelGroup
								className="h-full w-full gap-[0.19rem] px-2"
								direction="horizontal"
							>
								{/* Tools Panel */}
								<ResizablePanel
									className="min-w-0"
									defaultSize={toolsPanel}
									maxSize={40}
									minSize={15}
									onResize={setToolsPanel}
								>
									<MediaPanel />
								</ResizablePanel>

								<ResizableHandle withHandle />

								{/* Preview Area */}
								<ResizablePanel
									className="min-h-0 min-w-0 flex-1"
									defaultSize={previewPanel}
									minSize={30}
									onResize={setPreviewPanel}
								>
									<PreviewPanel />
								</ResizablePanel>

								<ResizableHandle withHandle />

								<ResizablePanel
									className="min-w-0"
									defaultSize={propertiesPanel}
									maxSize={40}
									minSize={15}
									onResize={setPropertiesPanel}
								>
									<PropertiesPanel />
								</ResizablePanel>
							</ResizablePanelGroup>
						</ResizablePanel>

						<ResizableHandle withHandle />

						{/* Timeline */}
						<ResizablePanel
							className="min-h-0 px-2 pb-2"
							defaultSize={timeline}
							maxSize={70}
							minSize={15}
							onResize={setTimeline}
						>
							<Timeline />
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
				<Onboarding />
			</div>
		</EditorProvider>
	);
}
