import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import Prose from "@/components/ui/prose";
import { Separator } from "@/components/ui/separator";
import { getPosts, getSinglePost, processHtmlContent } from "@/lib/blog-query";

type PageProps = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const slug = (await params).slug;

	const data = await getSinglePost(slug);

	if (!(data && data.post)) return {};

	return {
		title: data.post.title,
		description: data.post.description,
		twitter: {
			title: `${data.post.title}`,
			description: `${data.post.description}`,
			card: "summary_large_image",
			images: [
				{
					url: data.post.coverImage,
					width: "1200",
					height: "630",
					alt: data.post.title,
				},
			],
		},
		openGraph: {
			type: "article",
			images: [
				{
					url: data.post.coverImage,
					width: "1200",
					height: "630",
					alt: data.post.title,
				},
			],
			title: data.post.title,
			description: data.post.description,
			publishedTime: new Date(data.post.publishedAt).toISOString(),
			authors: [
				...data.post.authors.map((author: { name: string }) => author.name),
			],
		},
	};
}

export async function generateStaticParams() {
	const data = await getPosts();
	if (!(data && data.posts.length)) return [];

	return data.posts.map((post) => ({
		slug: post.slug,
	}));
}

async function Page({ params }: PageProps) {
	const slug = (await params).slug;
	const data = await getSinglePost(slug);
	if (!(data && data.post)) return notFound();

	const html = await processHtmlContent(data.post.content);

	const formattedDate = new Date(data.post.publishedAt).toLocaleDateString(
		"en-US",
		{
			day: "numeric",
			month: "long",
			year: "numeric",
		}
	);

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<main className="relative">
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="-top-40 -right-40 absolute h-96 w-96 rounded-full bg-gradient-to-br from-muted/20 to-transparent blur-3xl" />
					<div className="-left-40 absolute top-1/2 h-80 w-80 rounded-full bg-gradient-to-tr from-muted/10 to-transparent blur-3xl" />
				</div>

				<div className="container relative mx-auto max-w-3xl px-4 py-16">
					<div className="mb-6 text-center">
						{data.post.coverImage && (
							<div className="relative mb-6 aspect-video overflow-hidden rounded-lg">
								<Image
									alt={data.post.title}
									className="rounded-lg object-cover"
									fill
									loading="eager"
									src={data.post.coverImage}
								/>
							</div>
						)}
						<div className="mb-6 flex items-center justify-center">
							<time dateTime={data.post.publishedAt.toString()}>
								{formattedDate}
							</time>
						</div>

						<h1 className="mb-6 font-bold text-5xl tracking-tight md:text-4xl">
							{data.post.title}
						</h1>
						<div className="flex items-center justify-center gap-2">
							{data.post.authors[0] && (
								<>
									<Image
										alt={data.post.authors[0].name}
										className="aspect-square size-8 shrink-0 rounded-full"
										height={36}
										loading="eager"
										src={data.post.authors[0].image}
										width={36}
									/>
									<p className="text-muted-foreground">
										{data.post.authors[0].name}
									</p>
								</>
							)}
						</div>
					</div>
					<Separator />
					<section className="mt-14">
						<Prose html={html} />
					</section>
				</div>
			</main>
		</div>
	);
}

export default Page;
