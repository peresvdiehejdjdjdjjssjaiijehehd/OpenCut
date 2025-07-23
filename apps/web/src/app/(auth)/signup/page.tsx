"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, Suspense } from "react";
import { GoogleIcon } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSignUp } from "@/hooks/auth/useSignUp";

const SignUpPage = () => {
	const router = useRouter();
	const {
		name,
		setName,
		email,
		setEmail,
		password,
		setPassword,
		error,
		isAnyLoading,
		isEmailLoading,
		isGoogleLoading,
		handleSignUp,
		handleGoogleSignUp,
	} = useSignUp();

	return (
		<div className="relative flex h-screen items-center justify-center">
			<Button
				className="absolute top-6 left-6"
				onClick={() => router.back()}
				variant="text"
			>
				<ArrowLeft className="h-5 w-5" /> Back
			</Button>
			<Card className="w-[400px] border-0 shadow-lg">
				<CardHeader className="pb-4 text-center">
					<CardTitle className="font-semibold text-2xl">
						Create your account
					</CardTitle>
					<CardDescription className="text-base">
						Get started with your free account today
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-0">
					<Suspense
						fallback={
							<div className="text-center">
								<Loader2 className="animate-spin" />
							</div>
						}
					>
						<div className="flex flex-col space-y-6">
							{error && (
								<Alert variant="destructive">
									<AlertTitle>Error</AlertTitle>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}
							<Button
								disabled={isAnyLoading}
								onClick={handleGoogleSignUp}
								size="lg"
								variant="outline"
							>
								{isGoogleLoading ? (
									<Loader2 className="animate-spin" />
								) : (
									<GoogleIcon />
								)}{" "}
								Continue with Google
							</Button>
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<Separator className="w-full" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Or continue with
									</span>
								</div>
							</div>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Input
										className="h-11"
										disabled={isAnyLoading}
										id="name"
										onChange={(e) => setName(e.target.value)}
										placeholder="John Doe"
										type="text"
										value={name}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										className="h-11"
										disabled={isAnyLoading}
										id="email"
										onChange={(e) => setEmail(e.target.value)}
										placeholder="m@example.com"
										type="email"
										value={email}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										className="h-11"
										disabled={isAnyLoading}
										id="password"
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Create a strong password"
										type="password"
										value={password}
									/>
								</div>
								<Button
									className="h-11 w-full"
									disabled={isAnyLoading || !name || !email || !password}
									onClick={handleSignUp}
									size="lg"
								>
									{isEmailLoading ? (
										<Loader2 className="animate-spin" />
									) : (
										"Create account"
									)}
								</Button>
							</div>
						</div>
						<div className="mt-6 text-center text-sm">
							Already have an account?{" "}
							<Link
								className="font-medium text-primary underline-offset-4 hover:underline"
								href="/login"
							>
								Sign in
							</Link>
						</div>
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
};

export default memo(SignUpPage);
