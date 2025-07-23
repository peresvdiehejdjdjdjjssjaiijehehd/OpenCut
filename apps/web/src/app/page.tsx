import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/landing/hero";

export default async function Home() {
	return (
		<div>
			<Header />
			<Hero />
			<Footer />
		</div>
	);
}
