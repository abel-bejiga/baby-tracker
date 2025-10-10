import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baby Tracker - Track Your Baby's Growth",
  description: "A beautiful, minimal baby tracking app for monitoring feeding, sleep, diaper changes, and more.",
  keywords: ["baby tracker", "infant care", "parenting", "baby monitoring"],
  authors: [{ name: "Baby Tracker Team" }],
  openGraph: {
    title: "Baby Tracker",
    description: "Track your baby's growth and development with ease",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baby Tracker",
    description: "Track your baby's growth and development with ease",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
