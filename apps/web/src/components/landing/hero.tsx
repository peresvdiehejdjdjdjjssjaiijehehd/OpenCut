"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { VercelIcon } from "../icons";
import { Button } from "../ui/button";
import { SponsorButton } from "../ui/sponsor-button";
import { Handlebars } from "./handlebars";

export function Hero() {
	return (
		<div className="flex min-h-[calc(100vh-4.5rem)] flex-col items-center justify-between px-4 text-center supports-[height:100dvh]:min-h-[calc(100dvh-4.5rem)]">
			<Image
				alt="landing-page.bg"
				className="-z-50 absolute top-0 left-0 size-full object-cover"
				height={1903.5}
				src="/landing-page-bg.png"
				width={1269}
			/>
			<motion.div
				animate={{ opacity: 1 }}
				className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center"
				initial={{ opacity: 0 }}
				transition={{ duration: 1 }}
			>
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mb-8 flex justify-center"
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.6, duration: 0.8 }}
				>
					<SponsorButton
						companyName="Vercel"
						href="https://vercel.com/home?utm_source=opencut"
						logo={VercelIcon}
					/>
				</motion.div>
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="inline-block font-bold text-4xl tracking-tighter md:text-[4rem]"
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.2, duration: 0.8 }}
				>
					<h1>The Open Source</h1>
					<Handlebars>Video Editor</Handlebars>
				</motion.div>

				<motion.p
					animate={{ opacity: 1 }}
					className="mx-auto mt-10 max-w-xl font-light text-base text-muted-foreground tracking-wide sm:text-xl"
					initial={{ opacity: 0 }}
					transition={{ delay: 0.4, duration: 0.8 }}
				>
					A simple but powerful video editor that gets the job done. Works on
					any platform.
				</motion.p>

				<motion.div
					animate={{ opacity: 1 }}
					className="mt-8 flex justify-center gap-8"
					initial={{ opacity: 0 }}
					transition={{ delay: 0.6, duration: 0.8 }}
				>
					<Link href="/projects">
						<Button
							className="h-11 bg-foreground px-6 text-base"
							size="lg"
							type="submit"
						>
							Try early beta
							<ArrowRight className="relative z-10 ml-0.5 inline-block h-4 w-4" />
						</Button>
					</Link>
				</motion.div>
			</motion.div>
		</div>
	);
}
