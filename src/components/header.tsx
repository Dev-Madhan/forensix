"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";

export const navLinks = [
	{
		label: "Cases",
		href: "/cases",
	},
	{
		label: "Criminal Database",
		href: "/criminals",
	},
	{
		label: "Sketch Generator",
		href: "/sketch",
	},
	{
		label: "Dashboard",
		href: "/admin",
	},
];

export function Header() {
	const pathname = usePathname();
	const scrolled = useScroll(10);

	// Hide header on authentication pages for a clean, focused user experience
	if (pathname === "/auth" || pathname === "/signup") {
		return null;
	}

	return (
		<header
			className={cn(
				"sticky top-0 z-50 mx-auto w-full md:w-[calc(100%-2rem)] max-w-4xl border-border border-b-2 md:border-2 md:rounded-xl md:transition-all md:duration-300 md:ease-out mt-0 md:mt-3 lg:mt-4 bg-background/80 backdrop-blur-xl",
				{
					"md:top-3 lg:top-4 md:max-w-3xl md:shadow-lg md:shadow-white/5":
						scrolled,
				}
			)}
		>
			<nav
				className={cn(
					"relative flex h-14 w-full items-center justify-between px-4 md:h-12 md:px-3 lg:px-4 md:transition-all md:ease-out",
					{
						"md:px-2.5": scrolled,
					}
				)}
			>
				{/* Left: Brand Logo */}
				<Link
					className="flex items-center gap-2 font-heading text-base md:text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80 py-1 shrink-0 z-10"
					href="/"
				>
					<Image
						src="/images/Logo.png"
						alt="Forensix Logo"
						width={24}
						height={24}
						className="size-6 object-contain rounded-md"
						priority
					/>
					<span className="leading-none">Forensix</span>
				</Link>

				{/* Center: Navigation Links */}
				<div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-0.5 lg:gap-1">
					{navLinks.map((link) => (
						<Button
							key={link.label}
							size="sm"
							variant="ghost"
							className="text-muted-foreground hover:bg-surface hover:text-foreground transition-colors rounded-md text-xs lg:text-sm px-2 lg:px-3 h-8 font-medium whitespace-nowrap"
							render={<Link href={link.href} />}
							nativeButton={false}
						>
							{link.label}
						</Button>
					))}
				</div>

				{/* Right: Actions */}
				<div className="flex items-center gap-2 z-10">
					<Button
						size="sm"
						className="hidden md:inline-flex rounded-md text-xs lg:text-sm h-8 px-3 font-medium shrink-0"
						render={<Link href="/auth" />}
						nativeButton={false}
					>
						Get started
					</Button>
					<div className="md:hidden">
						<MobileNav />
					</div>
				</div>
			</nav>
		</header>
	);
}
