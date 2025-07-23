import type React from "react";
import { cn } from "@/lib/utils";

type ProseProps = React.HTMLAttributes<HTMLElement> & {
	as?: "article";
	html: string;
};

function Prose({ children, html, className }: ProseProps) {
	return (
		<article
			className={cn(
				"prose dark:prose-invert mx-auto max-w-none prose-p:text-justify prose-h2:font-semibold prose-a:text-blue-600 prose-h1:text-xl",
				className
			)}
		>
			{html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children}
		</article>
	);
}

export default Prose;
