"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa6";
import { RiDiscordFill, RiTwitterXLine } from "react-icons/ri";
import { getStars } from "@/lib/fetch-github-stars";

export function Footer() {
	const [_star, setStar] = useState<string>();

	useEffect(() => {
		const fetchStars = async () => {
			try {
				const data = await getStars();
				setStar(data);
			} catch (_err) {}
		};

		fetchStars();
	}, []);

	return (
		<motion.footer
			animate={{ opacity: 1 }}
			className="border-t bg-background"
			initial={{ opacity: 0 }}
			transition={{ delay: 0.8, duration: 0.8 }}
		>
			<div className="mx-auto max-w-5xl px-8 py-10">
				<div className="mb-8 grid grid-cols-1 gap-12 md:grid-cols-2">
					{/* Brand Section */}
					<div className="max-w-sm md:col-span-1">
						<div className="mb-4 flex items-center justify-start gap-2">
							<Image alt="OpenCut" height={24} src="/logo.svg" width={24} />
							<span className="font-bold text-lg">OpenCut</span>
						</div>
						<p className="mb-5 text-muted-foreground text-sm md:text-left">
							The open source video editor that gets the job done. Simple,
							powerful, and works on any platform.
						</p>
						<div className="flex justify-start gap-3">
							<Link
								className="text-muted-foreground transition-colors hover:text-foreground"
								href="https://github.com/OpenCut-app/OpenCut"
								rel="noopener noreferrer"
								target="_blank"
							>
								<FaGithub className="h-5 w-5" />
							</Link>
							<Link
								className="text-muted-foreground transition-colors hover:text-foreground"
								href="https://x.com/OpenCutApp"
								rel="noopener noreferrer"
								target="_blank"
							>
								<RiTwitterXLine className="h-5 w-5" />
							</Link>
							<Link
								className="text-muted-foreground transition-colors hover:text-foreground"
								href="https://discord.com/invite/Mu3acKZvCp"
								rel="noopener noreferrer"
								target="_blank"
							>
								<RiDiscordFill className="h-5 w-5" />
							</Link>
						</div>
					</div>

					<div className="flex items-start justify-start gap-12 py-2">
						<div>
							<h3 className="mb-4 font-semibold text-foreground">Resources</h3>
							<ul className="space-y-2 text-sm">
								<li>
									<Link
										className="text-muted-foreground transition-colors hover:text-foreground"
										href="/roadmap"
									>
										Roadmap
									</Link>
								</li>
								<li>
									<Link
										className="text-muted-foreground transition-colors hover:text-foreground"
										href="/privacy"
									>
										Privacy policy
									</Link>
								</li>
								<li>
									<Link
										className="text-muted-foreground transition-colors hover:text-foreground"
										href="/terms"
									>
										Terms of use
									</Link>
								</li>
							</ul>
						</div>

						{/* Company Links */}
						<div>
							<h3 className="mb-4 font-semibold text-foreground">Company</h3>
							<ul className="space-y-2 text-sm">
								<li>
									<Link
										className="text-muted-foreground transition-colors hover:text-foreground"
										href="/contributors"
									>
										Contributors
									</Link>
								</li>
								<li>
									<Link
										className="text-muted-foreground transition-colors hover:text-foreground"
										href="https://github.com/OpenCut-app/OpenCut/blob/main/README.md"
										rel="noopener noreferrer"
										target="_blank"
									>
										About
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="flex flex-col items-start justify-between gap-4 pt-2 md:flex-row">
					<div className="flex items-center gap-4 text-muted-foreground text-sm">
						<span>© 2025 OpenCut, All Rights Reserved</span>
					</div>
				</div>
			</div>
		</motion.footer>
	);
}
