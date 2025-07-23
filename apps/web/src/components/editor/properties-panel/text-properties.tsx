import { FontPicker } from "@/components/ui/font-picker";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { FontFamily } from "@/constants/font-constants";
import { useTimelineStore } from "@/stores/timeline-store";
import type { TextElement } from "@/types/timeline";
import {
	PropertyItem,
	PropertyItemLabel,
	PropertyItemValue,
} from "./property-item";

export function TextProperties({
	element,
	trackId,
}: {
	element: TextElement;
	trackId: string;
}) {
	const { updateTextElement } = useTimelineStore();

	return (
		<div className="space-y-6 p-5">
			<Textarea
				className="min-h-[4.5rem] resize-none bg-background/50"
				defaultValue={element.content}
				onChange={(e) =>
					updateTextElement(trackId, element.id, { content: e.target.value })
				}
				placeholder="Name"
			/>
			<PropertyItem direction="row">
				<PropertyItemLabel>Font</PropertyItemLabel>
				<PropertyItemValue>
					<FontPicker
						defaultValue={element.fontFamily}
						onValueChange={(value: FontFamily) =>
							updateTextElement(trackId, element.id, { fontFamily: value })
						}
					/>
				</PropertyItemValue>
			</PropertyItem>
			<PropertyItem direction="column">
				<PropertyItemLabel>Font size</PropertyItemLabel>
				<PropertyItemValue>
					<div className="flex items-center gap-2">
						<Slider
							className="w-full"
							defaultValue={[element.fontSize]}
							max={300}
							min={8}
							onValueChange={([value]) =>
								updateTextElement(trackId, element.id, { fontSize: value })
							}
							step={1}
						/>
						<Input
							className="!text-xs h-7 w-12 rounded-sm text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							onChange={(e) =>
								updateTextElement(trackId, element.id, {
									fontSize: Number.parseInt(e.target.value, 10),
								})
							}
							type="number"
							value={element.fontSize}
						/>
					</div>
				</PropertyItemValue>
			</PropertyItem>
		</div>
	);
}
