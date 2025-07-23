"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Tab, tabs, useMediaPanelStore } from "./store";

export function TabBar() {
	const { activeTab, setActiveTab } = useMediaPanelStore();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [isAtEnd, setIsAtEnd] = useState(false);
	const [isAtStart, setIsAtStart] = useState(true);

	const scrollToEnd = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTo({
				left: scrollContainerRef.current.scrollWidth,
			});
			setIsAtEnd(true);
			setIsAtStart(false);
		}
	};

	const scrollToStart = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTo({
				left: 0,
			});
			setIsAtStart(true);
			setIsAtEnd(false);
		}
	};

	const checkScrollPosition = () => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } =
				scrollContainerRef.current;
			const isAtEndNow = scrollLeft + clientWidth >= scrollWidth - 1;
			const isAtStartNow = scrollLeft <= 1;
			setIsAtEnd(isAtEndNow);
			setIsAtStart(isAtStartNow);
		}
	};

	// We're using useEffect because we need to sync with external DOM scroll events
	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		checkScrollPosition();
		container.addEventListener("scroll", checkScrollPosition);

		const resizeObserver = new ResizeObserver(checkScrollPosition);
		resizeObserver.observe(container);

		return () => {
			container.removeEventListener("scroll", checkScrollPosition);
			resizeObserver.disconnect();
		};
	}, []);

	return (
		<div className="flex">
			<ScrollButton
				direction="left"
				isVisible={!isAtStart}
				onClick={scrollToStart}
			/>
			<div
				className="scrollbar-x-hidden relative flex h-12 w-full items-center justify-start gap-5 overflow-x-auto bg-panel-accent px-3"
				ref={scrollContainerRef}
			>
				{(Object.keys(tabs) as Tab[]).map((tabKey) => {
					const tab = tabs[tabKey];
					return (
						<div
							className={cn(
								"flex cursor-pointer flex-col items-center gap-0.5",
								activeTab === tabKey ? "text-primary" : "text-muted-foreground"
							)}
							key={tabKey}
							onClick={() => setActiveTab(tabKey)}
						>
							<tab.icon className="!size-[1.1rem]" />
							<span className="text-[0.65rem]">{tab.label}</span>
						</div>
					);
				})}
			</div>
			<ScrollButton
				direction="right"
				isVisible={!isAtEnd}
				onClick={scrollToEnd}
			/>
		</div>
	);
}

function ScrollButton({
	direction,
	onClick,
	isVisible,
}: {
	direction: "left" | "right";
	onClick: () => void;
	isVisible: boolean;
}) {
	if (!isVisible) return null;

	const Icon = direction === "left" ? ChevronLeft : ChevronRight;

	return (
		<div className="flex h-full w-12 items-center justify-center bg-panel-accent">
			<Button
				className="!bg-foreground/10 h-7 w-4 rounded-[0.4rem]"
				onClick={onClick}
				size="icon"
			>
				<Icon className="!size-4 text-foreground" />
			</Button>
		</div>
	);
}
