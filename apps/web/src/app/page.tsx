import { Footer } from "@/components/footer";
import type { Metadata } from "next";
import { SITE_URL } from "@/constants/site";
import { Header } from "@/components/header";
import { Hero } from "@/components/landing/hero";

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};

export default function Home() {
	return (
		<div>
			<Header />
			<Hero />
			<Footer />
		</div>
	);
}
