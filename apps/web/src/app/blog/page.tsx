import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getPosts } from "@/lib/blog-query";

export const metadata: Metadata = {
	title: "Blog - OpenCut",
	description:
		"Read the latest news and updates about OpenCut, the free and open-source video editor.",
	openGraph: {
		title: "Blog - OpenCut",
		description:
			"Read the latest news and updates about OpenCut, the free and open-source video editor.",
		type: "website",
	},
};

export default async function BlogPage() {
	const data = await getPosts();
	if (!(data && data.posts)) return <div>No posts yet</div>;

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<main className="relative">
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="-top-40 -right-40 absolute h-96 w-96 rounded-full bg-gradient-to-br from-muted/20 to-transparent blur-3xl" />
					<div className="-left-40 absolute top-1/2 h-80 w-80 rounded-full bg-gradient-to-tr from-muted/10 to-transparent blur-3xl" />
				</div>

				<div className="container relative mx-auto max-w-3xl px-4 py-16">
					<div className="mb-20 text-center">
						<h1 className="mb-6 font-bold text-5xl tracking-tight md:text-6xl">
							Blog
						</h1>
						<p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl leading-relaxed">
							Read the latest news and updates about OpenCut, the free and
							open-source video editor.
						</p>
					</div>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{data.posts.map((post) => (
							<Link href={`/blog/${post.slug}`} key={post.id}>
								<Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
									{post.coverImage && (
										<div className="relative aspect-video">
											<Image
												alt={post.title}
												className="rounded-xl object-cover"
												fill
												src={post.coverImage}
											/>
										</div>
									)}

									<CardContent className="p-6">
										{post.authors && post.authors.length > 0 && (
											<div className="mb-4 flex items-center gap-2">
												{post.authors.map((author, index) => (
													<div
														className="flex items-center gap-2"
														key={author.id}
													>
														<Avatar className="h-6 w-6">
															<AvatarImage
																alt={author.name}
																src={author.image}
															/>
															<AvatarFallback className="text-xs">
																{author.name.charAt(0).toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<span className="text-muted-foreground text-sm">
															{author.name}
														</span>
														{index < post.authors.length - 1 && (
															<span className="text-muted-foreground">•</span>
														)}
													</div>
												))}
											</div>
										)}
										<h2 className="mb-2 font-semibold text-xl">{post.title}</h2>
										<p className="text-muted-foreground">{post.description}</p>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
