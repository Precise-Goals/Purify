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
      <header className="pointer-events-auto rounded-full bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border border-zinc-200/75 shadow-[0_8px_32px_-8px_rgba(24,24,27,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] px-4 sm:px-6 h-14 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Wind className="w-4 h-4 text-zinc-100" aria-hidden="true" />
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
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1 rounded-full border border-zinc-200/60"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${
                  isActive
                    ? "bg-zinc-950 text-white shadow-sm font-semibold"
                    : "text-zinc-700 hover:text-zinc-950 hover:bg-white/80 font-medium"
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
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
            className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            aria-label="Purify GitHub Repository"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
          >
            <span>Launch Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-full bg-zinc-950 text-white text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            Launch
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="p-2 text-zinc-700 hover:text-zinc-950 rounded-full hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile navigation"
          className="pointer-events-auto mt-2 md:hidden rounded-2xl border border-zinc-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${
                  isActive
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between">
            <a
              href="https://github.com/Precise-Goals/Purify"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-700 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Precise-Goals/Purify</span>
            </a>
            <span className="text-[10px] text-emerald-700 font-mono font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" aria-hidden="true" />
              <span>GCP Active</span>
            </span>
          </div>
        </nav>
      )}
    </div>
  );
};
