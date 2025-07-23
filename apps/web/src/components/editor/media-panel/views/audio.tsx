"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function AudioView() {
	const [search, setSearch] = useState("");
	return (
		<div className="flex h-full flex-col gap-2 p-4">
			<Input
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search songs and artists"
				value={search}
			/>
			<div className="flex flex-col gap-2" />
		</div>
	);
}
