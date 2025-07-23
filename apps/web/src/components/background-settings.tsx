import { PipetteIcon } from "lucide-react";
import Image from "next/image";
import { colors } from "@/data/colors";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/project-store";
import { BackgroundIcon } from "./icons";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type BackgroundTab = "color" | "blur";

export function BackgroundSettings() {
	const { activeProject, updateBackgroundType } = useProjectStore();

	// ✅ Good: derive activeTab from activeProject during rendering
	const activeTab = activeProject?.backgroundType || "color";

	const handleColorSelect = (color: string) => {
		updateBackgroundType("color", { backgroundColor: color });
	};

	const handleBlurSelect = (blurIntensity: number) => {
		updateBackgroundType("blur", { blurIntensity });
	};

	const tabs = [
		{
			label: "Color",
			value: "color",
		},
		{
			label: "Blur",
			value: "blur",
		},
	];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className="!size-4 border border-muted-foreground"
					size="icon"
					variant="text"
				>
					<BackgroundIcon className="!size-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="flex h-[16rem] w-[20rem] flex-col items-start overflow-hidden p-0">
				<div className="z-10 flex w-full items-center justify-between gap-2 bg-popover p-3">
					<h2 className="text-sm">Background</h2>
					<div className="flex items-center gap-2 text-sm">
						{tabs.map((tab) => (
							<span
								className={cn(
									"cursor-pointer text-muted-foreground",
									activeTab === tab.value && "text-foreground"
								)}
								key={tab.value}
								onClick={() => {
									// Switch to the background type when clicking tabs
									if (tab.value === "color") {
										updateBackgroundType("color", {
											backgroundColor:
												activeProject?.backgroundColor || "#000000",
										});
									} else {
										updateBackgroundType("blur", {
											blurIntensity: activeProject?.blurIntensity || 8,
										});
									}
								}}
							>
								{tab.label}
							</span>
						))}
					</div>
				</div>
				{activeTab === "color" ? (
					<ColorView
						onColorSelect={handleColorSelect}
						selectedColor={activeProject?.backgroundColor || "#000000"}
					/>
				) : (
					<BlurView
						onBlurSelect={handleBlurSelect}
						selectedBlur={activeProject?.blurIntensity || 8}
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}

function ColorView({
	selectedColor,
	onColorSelect,
}: {
	selectedColor: string;
	onColorSelect: (color: string) => void;
}) {
	return (
		<div className="h-full w-full">
			<div className="pointer-events-none absolute top-8 left-0 h-12 w-[calc(100%-1rem)] bg-gradient-to-b from-popover to-transparent" />
			<div className="grid h-full w-full grid-cols-4 gap-2 overflow-auto p-3 pt-0">
				<div className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-sm border border-foreground/15 hover:border-primary">
					<PipetteIcon className="size-4" />
				</div>
				{colors.map((color) => (
					<ColorItem
						color={color}
						isSelected={color === selectedColor}
						key={color}
						onClick={() => onColorSelect(color)}
					/>
				))}
			</div>
		</div>
	);
}

function ColorItem({
	color,
	isSelected,
	onClick,
}: {
	color: string;
	isSelected: boolean;
	onClick: () => void;
}) {
	return (
		<div
			className={cn(
				"aspect-square w-full cursor-pointer rounded-sm hover:border-2 hover:border-primary",
				isSelected && "border-2 border-primary"
			)}
			onClick={onClick}
			style={{ backgroundColor: color }}
		/>
	);
}

function BlurView({
	selectedBlur,
	onBlurSelect,
}: {
	selectedBlur: number;
	onBlurSelect: (blurIntensity: number) => void;
}) {
	const blurLevels = [
		{ label: "Light", value: 4 },
		{ label: "Medium", value: 8 },
		{ label: "Heavy", value: 18 },
	];
	const blurImage =
		"https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

	return (
		<div className="grid w-full grid-cols-3 gap-2 p-3 pt-0">
			{blurLevels.map((blur) => (
				<div
					className={cn(
						"relative aspect-square w-full cursor-pointer overflow-hidden rounded-sm hover:border-2 hover:border-primary",
						selectedBlur === blur.value && "border-2 border-primary"
					)}
					key={blur.value}
					onClick={() => onBlurSelect(blur.value)}
				>
					<Image
						alt={`Blur preview ${blur.label}`}
						className="object-cover"
						fill
						src={blurImage}
						style={{ filter: `blur(${blur.value}px)` }}
					/>
					<div className="absolute right-1 bottom-1 left-1 text-center">
						<span className="rounded bg-black/50 px-1 text-white text-xs">
							{blur.label}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}
