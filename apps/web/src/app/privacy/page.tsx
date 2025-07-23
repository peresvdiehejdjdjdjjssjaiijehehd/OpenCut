import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { GithubIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Privacy Policy - OpenCut",
	description:
		"Learn how OpenCut handles your data and privacy. Our commitment to protecting your information while you edit videos.",
	openGraph: {
		title: "Privacy Policy - OpenCut",
		description:
			"Learn how OpenCut handles your data and privacy. Our commitment to protecting your information while you edit videos.",
		type: "website",
	},
};

export default function PrivacyPage() {
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
								Privacy Policy
							</h1>
							<p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl leading-relaxed">
								Learn how we handle your data and privacy. Contact us if you
								have any questions.
							</p>
						</div>
						<Card className="border-2 border-muted/30 bg-background/80 backdrop-blur-sm">
							<CardContent className="space-y-8 p-8 text-base leading-relaxed">
								<section>
									<h2 className="mb-4 font-semibold text-2xl">
										Your Videos Stay Private
									</h2>
									<p className="mb-4">
										<strong>
											OpenCut processes all videos locally on your device.
										</strong>{" "}
										We never upload, store, or have access to your video files.
										Your content remains completely private and under your
										control at all times.
									</p>
									<p>
										All video editing, rendering, and processing happens in your
										browser using WebAssembly and local storage. No video data
										is transmitted to our servers.
									</p>
								</section>

								<section>
									<h2 className="mb-4 font-semibold text-2xl">
										Account Information
									</h2>
									<p className="mb-4">
										When you create an account, we only collect:
									</p>
									<ul className="mb-4 list-disc space-y-2 pl-6">
										<li>Email address (for account access)</li>
										<li>
											Profile information from Google OAuth (if you choose to
											sign in with Google)
										</li>
									</ul>
									<p className="mb-4">
										<strong>
											We do NOT store your projects on our servers.
										</strong>{" "}
										All project data, including names, thumbnails, and creation
										dates, is stored locally in your browser using IndexedDB.
									</p>
									<p>
										We use{" "}
										<a
											className="text-primary hover:underline"
											href="https://www.better-auth.com"
											rel="noopener"
											target="_blank"
										>
											Better Auth
										</a>{" "}
										for secure authentication and follow industry-standard
										security practices.
									</p>
								</section>

								<section>
									<h2 className="mb-4 font-semibold text-2xl">Analytics</h2>
									<p className="mb-4">
										We use{" "}
										<a
											className="text-primary hover:underline"
											href="https://www.databuddy.cc"
											rel="noopener"
											target="_blank"
										>
											Databuddy
										</a>{" "}
										for completely anonymized and non-invasive analytics to
										understand how people use OpenCut.
									</p>
									<p>
										This helps us improve the editor, but we never collect
										personal information, track individual users, or store any
										data that could identify you.
									</p>
								</section>

								<section>
									<h2 className="mb-4 font-semibold text-2xl">
										Local Storage & Cookies
									</h2>
									<p className="mb-4">
										We use browser local storage and IndexedDB to:
									</p>
									<ul className="mb-4 list-disc space-y-2 pl-6">
										<li>Save your projects locally on your device</li>
										<li>Remember your editor preferences and settings</li>
										<li>Keep you logged in across browser sessions</li>
									</ul>
									<p>
										All data stays on your device and can be cleared at any time
										through your browser settings.
									</p>
								</section>

								<section>
									<h2 className="mb-4 font-semibold text-2xl">
										Third-Party Services
									</h2>
									<p className="mb-4">
										OpenCut integrates with these services:
									</p>
									<ul className="mb-4 list-disc space-y-2 pl-6">
										<li>
											<strong>Google OAuth:</strong> For optional Google sign-in
											(governed by Google's privacy policy)
										</li>
										<li>
											<strong>Vercel:</strong> For hosting and content delivery
										</li>
										<li>
											<strong>Databuddy:</strong> For anonymized analytics
										</li>
									</ul>
								</section>

								<section>
									<h2 className="mb-4 font-semibold text-2xl">Your Rights</h2>
									<p className="mb-4">
										You have complete control over your data:
									</p>
									<ul className="mb-4 list-disc space-y-2 pl-6">
										<li>
											Delete your account and all associated data at any time
										</li>
										<li>Export your project data</li>
										<li>Clear local storage to remove all saved projects</li>
										<li>Contact us with any privacy concerns</li>
									</ul>
								</section>

								<section>
									<h2 className="mb-4 font-semibold text-2xl">
										Open Source Transparency
									</h2>
									<p className="mb-4">
										OpenCut is completely open source. You can review our code,
										see exactly how we handle data, and even self-host the
										application if you prefer.
									</p>
									<p>
										View our source code on{" "}
										<a
											className="text-primary hover:underline"
											href="https://github.com/OpenCut-app/OpenCut"
											rel="noopener"
											target="_blank"
										>
											GitHub
										</a>
										.
									</p>
								</section>

								<section>
									<h2 className="mb-4 font-semibold text-2xl">Contact Us</h2>
									<p className="mb-4">
										Questions about this privacy policy or how we handle your
										data?
									</p>
									<p>
										Open an issue on our{" "}
										<a
											className="text-primary hover:underline"
											href="https://github.com/OpenCut-app/OpenCut/issues"
											rel="noopener"
											target="_blank"
										>
											GitHub repository
										</a>
										, email us at{" "}
										<a
											className="text-primary hover:underline"
											href="mailto:oss@opencut.app"
										>
											oss@opencut.app
										</a>
										, or reach out on{" "}
										<a
											className="text-primary hover:underline"
											href="https://x.com/opencutapp"
											rel="noopener"
											target="_blank"
										>
											X (Twitter)
										</a>
										.
									</p>
								</section>

								<p className="mt-8 border-muted/20 border-t pt-8 text-muted-foreground text-sm">
									Last updated: July 14, 2025
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
