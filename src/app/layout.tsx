import type { Metadata } from "next";
import { Inter, Space_Grotesk, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { HeaderServer } from "@/components/header-server";
import { ToastListener } from "@/components/toast-listener";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forensix",
  description: "Advanced forensics application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <HeaderServer />
            <ToastListener />
            {children}
            <Toaster
          position="bottom-right"
          theme="dark"
          closeButton
          toastOptions={{
            duration: 4000,
            classNames: {
              toast:
                "!border-2 !border-border bg-background/80 backdrop-blur-xl shadow-xl rounded-xl font-sans text-foreground",
              description: "text-muted-foreground",
              actionButton: "bg-primary text-primary-foreground",
              cancelButton: "bg-muted text-muted-foreground",
              closeButton: "bg-background border-border text-foreground hover:bg-muted",
            },
          }}
        />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
