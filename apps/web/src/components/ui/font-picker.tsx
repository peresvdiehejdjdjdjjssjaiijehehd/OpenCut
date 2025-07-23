import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FONT_OPTIONS, type FontFamily } from "@/constants/font-constants";

interface FontPickerProps {
	defaultValue?: FontFamily;
	onValueChange?: (value: FontFamily) => void;
	className?: string;
}

export function FontPicker({
	defaultValue,
	onValueChange,
	className,
}: FontPickerProps) {
	return (
		<Select defaultValue={defaultValue} onValueChange={onValueChange}>
			<SelectTrigger className={`w-full text-xs ${className || ""}`}>
				<SelectValue placeholder="Select a font" />
			</SelectTrigger>
			<SelectContent>
				{FONT_OPTIONS.map((font) => (
					<SelectItem
						className="text-xs"
						key={font.value}
						style={{ fontFamily: font.value }}
						value={font.value}
					>
						{font.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
