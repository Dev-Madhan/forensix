import { cn } from "@/lib/utils";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Portal, PortalBackdrop } from "@/components/portal";
import { navLinks } from "@/components/header";
import { X, Menu } from "lucide-react";

interface MobileNavProps {
	user?: {
		name: string;
		email: string;
		image?: string;
		role?: string;
	};
}

export function MobileNav({ user }: MobileNavProps) {
	const [open, setOpen] = React.useState(false);

	// Close drawer on Escape key
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		if (open) {
			window.addEventListener("keydown", handleKeyDown);
		}
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	return (
		<div className="md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle navigation menu"
				className="size-9 rounded-md border border-border bg-transparent text-foreground hover:bg-surface hover:text-foreground transition-colors"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="ghost"
			>
				{open ? (
					<X className="size-5" />
				) : (
					<Menu className="size-5" />
				)}
			</Button>

			{open && (
				<Portal className="top-14" id="mobile-menu">
					<PortalBackdrop onClick={() => setOpen(false)} />
					<nav
						aria-label="Mobile Navigation"
						className={cn(
							"flex flex-col bg-background/95 backdrop-blur-2xl border-b-2 border-border px-6 py-6 shadow-2xl",
							"animate-in fade-in-0 slide-in-from-top-2 duration-150"
						)}
					>
						<div className="flex flex-col space-y-1 max-w-md mx-auto w-full">
							{navLinks
								.filter(link => link.label !== "Dashboard" || !!user)
								.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									onClick={() => setOpen(false)}
									className="py-2.5 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
								>
									{link.label}
								</Link>
							))}

							<div className="mt-6 pt-5 border-t border-border">
								{user ? (
									<div className="flex flex-col gap-1">
										<p className="text-sm font-semibold text-foreground">{user.name}</p>
										<p className="text-xs text-muted-foreground">{user.email}</p>
									</div>
								) : (
									<Button
										className="w-full h-10 rounded-md font-medium"
										onClick={() => setOpen(false)}
										render={<Link href="/auth" />}
										nativeButton={false}
									>
										Get started
									</Button>
								)}
							</div>
						</div>
					</nav>
				</Portal>
			)}
		</div>
	);
}
