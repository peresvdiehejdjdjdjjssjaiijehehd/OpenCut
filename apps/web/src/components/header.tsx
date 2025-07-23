"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HeaderBase } from "./header-base";
import { Button } from "./ui/button";

export function Header() {
	const leftContent = (
		<Link className="flex items-center gap-3" href="/">
			<Image alt="OpenCut Logo" height={32} src="/logo.svg" width={32} />
			<span className="hidden font-medium text-xl md:block">OpenCut</span>
		</Link>
	);

	const rightContent = (
		<nav className="flex items-center gap-3">
			<Link href="/blog">
				<Button className="p-0 text-sm" variant="text">
					Blog
				</Button>
			</Link>
			<Link href="/contributors">
				<Button className="p-0 text-sm" variant="text">
					Contributors
				</Button>
			</Link>
			<Link href="/projects">
				<Button className="ml-4 text-sm" size="sm">
					Projects
					<ArrowRight className="h-4 w-4" />
				</Button>
			</Link>
		</nav>
	);

	return (
		<div className="mx-4 md:mx-0">
			<HeaderBase
				className="mx-auto mt-4 max-w-3xl rounded-2xl border bg-accent pr-[14px] pl-4"
				leftContent={leftContent}
				rightContent={rightContent}
			/>
		</div>
	);
}
