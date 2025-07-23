import { motion } from "motion/react";
import type { ComponentType } from "react";

interface SponsorButtonProps {
	href: string;
	logo: ComponentType<{ className?: string }>;
	companyName: string;
	className?: string;
}

export function SponsorButton({
	href,
	logo: Logo,
	companyName,
	className = "",
}: SponsorButtonProps) {
	return (
		<motion.a
			className={`group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 ${className}`}
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			<span className="font-medium text-xs text-zinc-400 transition-colors group-hover:text-zinc-300">
				Sponsored by
			</span>

			<div className="flex items-center gap-1.5">
				<div className="text-zinc-100 transition-colors group-hover:text-white">
					<Logo className="h-4 w-4" />
				</div>

				<span className="font-medium text-xs text-zinc-100 transition-colors group-hover:text-white">
					{companyName}
				</span>
			</div>
		</motion.a>
	);
}
