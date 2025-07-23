import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { GithubIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const roadmapItems: {
	title: string;
	description: string;
	status: {
		text: string;
		type: "complete" | "pending" | "default" | "info";
	};
}[] = [
	{
		title: "Start",
		description:
			"This is where it all started. Repository created, initial project structure, and the vision for a free, open-source video editor. [Check out the first tweet](https://x.com/mazeincoding/status/1936706642512388188) to see where it started.",
		status: {
			text: "Completed",
			type: "complete",
		},
	},
	{
		title: "Core UI",
		description:
			"Built the foundation - main layout, header, sidebar, timeline container, and basic component structure. Not all functionality yet, but the UI framework that everything else builds on.",
		status: {
			text: "Completed",
			type: "complete",
		},
	},
	{
		title: "Basic Functionality",
		description:
			"The heart of any video editor. Timeline zoom in/out, making clips longer/shorter, dragging elements around, selection, playhead scrubbing. **This part has to be fucking perfect** because it's what users interact with 99% of the time.",
		status: {
			text: "In Progress",
			type: "pending",
		},
	},
	{
		title: "Export/Preview Logic",
		description:
			"The foundation that enables everything else. Real-time preview, video rendering, export functionality. Once this works, we can add effects, filters, transitions - basically everything that makes a video editor powerful.",
		status: {
			text: "In Progress",
			type: "pending",
		},
	},
	{
		title: "Text",
		description:
			"After media, text is the next most important thing. Font selection with custom font imports, text stroke, colors. All the text essential text properties.",
		status: {
			text: "Not Started",
			type: "default",
		},
	},
	{
		title: "Effects",
		description:
			"Adding visual effects to both text and media. Blur, brightness, contrast, saturation, filters, and all the creative tools that make videos pop. This is where the magic happens.",
		status: {
			text: "Not Started",
			type: "default",
		},
	},
	{
		title: "Transitions",
		description:
			"Smooth transitions between clips. Fade in/out, slide, zoom, dissolve, and custom transition effects.",
		status: {
			text: "Not Started",
			type: "default",
		},
	},
	{
		title: "Refine from Here",
		description:
			"Once we nail the above, we have a **solid foundation** to build anything. Advanced features, performance optimizations, mobile support, desktop app.",
		status: {
			text: "Future",
			type: "info",
		},
	},
];

export const metadata: Metadata = {
	title: "Roadmap - OpenCut",
	description:
		"See what's coming next for OpenCut - the free, open-source video editor that respects your privacy.",
	openGraph: {
		title: "OpenCut Roadmap - What's Coming Next",
		description:
			"See what's coming next for OpenCut - the free, open-source video editor that respects your privacy.",
		type: "website",
		images: [
			{
				url: "/open-graph/roadmap.jpg",
				width: 1200,
				height: 630,
				alt: "OpenCut Roadmap",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "OpenCut Roadmap - What's Coming Next",
		description:
			"See what's coming next for OpenCut - the free, open-source video editor that respects your privacy.",
		images: ["/open-graph/roadmap.jpg"],
	},
};

export default function RoadmapPage() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<main className="relative">
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="-top-40 -right-40 absolute h-96 w-96 rounded-full bg-gradient-to-br from-muted/20 to-transparent blur-3xl" />
					<div className="-left-40 absolute top-1/2 h-80 w-80 rounded-full bg-gradient-to-tr from-muted/10 to-transparent blur-3xl" />
				</div>
				<div className="container relative mx-auto px-4 py-16">
					<div className="mx-auto max-w-4xl">
						<div className="mb-10 text-center">
							<Link
								href="https://github.com/OpenCut-app/OpenCut"
								target="_blank"
							>
								<Badge className="mb-6 gap-2" variant="secondary">
									<GithubIcon className="h-3 w-3" />
									Open Source
								</Badge>
							</Link>
							<h1 className="mb-6 font-bold text-5xl tracking-tight md:text-6xl">
								Roadmap
							</h1>
							<p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl leading-relaxed">
								What's coming next for OpenCut (last updated: July 14, 2025)
							</p>
						</div>
						<div className="space-y-6">
							{roadmapItems.map((item, index) => (
								<div className="relative" key={index}>
									<div className="flex items-start gap-2">
										<span className="select-none font-medium text-lg text-muted-foreground leading-[1.5]">
											{index + 1}.
										</span>
										<div className="flex-1 pt-[2px]">
											<div className="mb-2 flex items-center gap-2">
												<h3 className="font-medium text-lg">{item.title}</h3>
												<Badge
													className={cn("shadow-none", {
														"!bg-green-500 text-white":
															item.status.type === "complete",
														"!bg-yellow-500 text-white":
															item.status.type === "pending",
														"!bg-blue-500 text-white":
															item.status.type === "info",
														"!bg-foreground/10 text-accent-foreground":
															item.status.type === "default",
													})}
												>
													{item.status.text}
												</Badge>
											</div>
											<div className="text-foreground/70 leading-relaxed">
												<ReactMarkdown
													components={{
														a: ({ className, children, ...props }) => (
															<a
																className={cn(
																	"text-primary hover:underline",
																	className
																)}
																rel="noopener noreferrer"
																target="_blank"
																{...props}
															>
																{children}
															</a>
														),
														strong: ({ children }) => (
															<strong className="font-semibold text-foreground">
																{children}
															</strong>
														),
													}}
												>
													{item.description}
												</ReactMarkdown>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="mt-12 border-muted/20 border-t pt-8">
							<div className="space-y-4 text-center">
								<h3 className="font-semibold text-xl">Want to Help?</h3>
								<p className="mx-auto max-w-2xl text-muted-foreground">
									OpenCut is open source and built by the community. Every
									contribution, no matter how small, helps us build the best
									free video editor possible.
								</p>
								<div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
									<Link
										href="https://github.com/OpenCut-app/OpenCut/blob/main/.github/CONTRIBUTING.md"
										rel="noopener noreferrer"
										target="_blank"
									>
										<Badge
											className="px-4 py-2 text-sm transition-colors hover:bg-muted/50"
											variant="outline"
										>
											<GithubIcon className="mr-2 h-4 w-4" />
											Start Contributing
										</Badge>
									</Link>
									<Link
										href="https://github.com/OpenCut-app/OpenCut/issues"
										rel="noopener noreferrer"
										target="_blank"
									>
										<Badge
											className="px-4 py-2 text-sm transition-colors hover:bg-muted/50"
											variant="outline"
										>
											Report Issues
										</Badge>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
