import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SmartAmbientBackground } from "@/components/SmartAmbientBackground";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Purify — Gemini AI Smog Intelligence & Clean Air Assistant",
  description:
    "Next-generation urban air quality assistant powered by Google Cloud & Gemini AI. Deterministic PM2.5 exposure mitigation models with modern bento-grid intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased min-h-screen bg-transparent text-zinc-900 flex flex-col font-sans selection:bg-zinc-950 selection:text-white relative">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-zinc-950 focus:text-white focus:text-xs focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-950"
        >
          Skip to main content
        </a>
        <SmartAmbientBackground />
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full pt-4 sm:pt-6 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
