import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { BotIdClient } from "botid/client";
import { env } from "@/env";
import { StorageProvider } from "../components/storage-provider";
import { Toaster } from "../components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";
import { defaultFont } from "../lib/font-config";
import { baseMetaData } from "./metadata";

export const metadata = baseMetaData;

const protectedRoutes = [
	{
		path: "/api/waitlist",
		method: "POST",
	},
];

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<BotIdClient protect={protectedRoutes} />
			</head>
			<body className={`${defaultFont.className} font-sans antialiased`}>
				<ThemeProvider attribute="class" forcedTheme="dark">
					<TooltipProvider>
						<StorageProvider>{children}</StorageProvider>
						<Analytics />
						<Toaster />
						<Script
							async
							data-client-id="UP-Wcoy5arxFeK7oyjMMZ"
							data-disabled={env.NODE_ENV === "development"}
							data-track-attributes={false}
							data-track-errors={true}
							data-track-outgoing-links={false}
							data-track-sessions={false}
							data-track-web-vitals={false}
							src="https://cdn.databuddy.cc/databuddy.js"
							strategy="afterInteractive"
						/>
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
