import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
      <body className="antialiased min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-950 selection:text-white relative">
        <div className="ambient-bg-gradient" aria-hidden="true" />
        <div className="ambient-bg-noise" aria-hidden="true" />
        <Navbar />
        <main className="flex-1 w-full pt-4 sm:pt-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
