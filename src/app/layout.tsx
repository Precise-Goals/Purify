import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BreatheWise — Gemini AI Smog-Season Assistant",
  description:
    "Personalized, form-first winter smog protection assistant with deterministic PM2.5 impact models and BYO Gemini API key.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
