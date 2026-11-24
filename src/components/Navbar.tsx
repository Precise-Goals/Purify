"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wind, LayoutDashboard, Info, Home, Menu, X, ArrowRight } from "lucide-react";
import { GithubIcon } from "./GithubIcon";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/about", label: "About", icon: Info },
  ];

  return (
    <div className="sticky top-4 z-50 w-full max-w-5xl mx-auto px-4 sm:px-6 pointer-events-none">
      <header className="pointer-events-auto rounded-full bg-white/80 backdrop-blur-md border border-zinc-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] px-4 sm:px-6 h-14 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Wind className="w-4 h-4 text-zinc-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-zinc-950 group-hover:text-zinc-700 transition-colors">
              Purify
            </span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/80">
              AI + GCP
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1 rounded-full border border-zinc-200/60">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all ${
                  isActive
                    ? "bg-zinc-950 text-white shadow-sm font-semibold"
                    : "text-zinc-600 hover:text-zinc-950 hover:bg-white/80 font-medium"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Links */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="https://github.com/Precise-Goals/Purify"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors"
            aria-label="GitHub Repository"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
          >
            <span>Launch Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-full bg-zinc-950 text-white text-xs font-semibold shadow-xs"
          >
            Launch
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-zinc-600 hover:text-zinc-950 rounded-full hover:bg-zinc-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Floating Anchored Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-2 p-3 bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl shadow-xl space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between text-xs px-2 text-zinc-500">
            <a
              href="https://github.com/Precise-Goals/Purify"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-zinc-950"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Precise-Goals/Purify</span>
            </a>
            <span className="text-[10px] text-zinc-700 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              GCP Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
