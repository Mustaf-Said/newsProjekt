"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPageUrl } from "@/utils";
import {
  Home, Newspaper, Trophy, ShoppingBag,
  Menu, X, ChevronDown, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const pathSegment = pathname === "/" ? "Home" : pathname.replace(/^\//, "").split("/")[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const navItems = [
    { label: "Home", page: "Home", icon: Home },
    {
      label: "News", icon: Newspaper, children: [
        { label: "Local News", page: "LocalNews" },
        { label: "World News", page: "WorldNews" },
        { label: "Football News", page: "FootballNews" },
      ],
    },
    { label: "Live Scores", page: "LiveScores", icon: Trophy },
    {
      label: "Marketplace", icon: ShoppingBag, children: [
        { label: "Cars", page: "MarketplaceCars" },
        { label: "Houses", page: "MarketplaceHouses" },
        { label: "Land", page: "MarketplaceLand" },
      ],
    },
  ];

  const isActive = (page: string) => page.toLowerCase() === pathSegment.toLowerCase();

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <style>{`
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-card: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --accent: #f59e0b;
          --accent-hover: #d97706;
          --border: #e2e8f0;
          --navy: #0f172a;
          --navy-light: #1e293b;
        }
        .dark {
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --bg-card: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --border: #334155;
        }
      `}</style>

      <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen transition-colors duration-300">
        <div className="bg-[var(--navy)] text-white/80 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="hover:text-[var(--accent)] transition-colors">
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <span>Welcome, Guest</span>
            </div>
          </div>
        </div>

        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[var(--bg-primary)]/95 backdrop-blur-xl shadow-lg" : "bg-[var(--bg-primary)] shadow-sm"}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href={createPageUrl("Home")} className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight leading-none">RAYGAL</span>
                  <span className="text-[10px] font-medium text-[var(--text-secondary)] tracking-widest uppercase">News & Market</span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) =>
                  item.children ? (
                    <DropdownMenu key={item.label}>
                      <DropdownMenuTrigger className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.page} asChild>
                            <Link href={createPageUrl(child.page)} className="cursor-pointer">
                              {child.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      key={item.page}
                      href={createPageUrl(item.page)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.page)
                        ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                )}
              </nav>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden border-t border-[var(--border)] bg-[var(--bg-primary)] animate-in slide-in-from-top-2">
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) =>
                  item.children ? (
                    <div key={item.label}>
                      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{item.label}</p>
                      {item.children.map((child) => (
                        <Link
                          key={child.page}
                          href={createPageUrl(child.page)}
                          onClick={() => setMobileOpen(false)}
                          className="block px-6 py-2.5 text-sm rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.page}
                      href={createPageUrl(item.page)}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive(item.page) ? "bg-amber-50 text-amber-600" : "hover:bg-[var(--bg-secondary)]"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          )}
        </header>

        <main className="min-h-[calc(100vh-200px)]">
          {children}
        </main>

        <footer className="bg-[var(--navy)] text-white/70 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-lg font-black">RAYGAL</span>
                </div>
                <p className="text-sm leading-relaxed">Your trusted source for breaking news, live sports, and the best marketplace deals.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">News</h4>
                <div className="space-y-2">
                  <Link href={createPageUrl("LocalNews")} className="block text-sm hover:text-amber-400 transition-colors">Local News</Link>
                  <Link href={createPageUrl("WorldNews")} className="block text-sm hover:text-amber-400 transition-colors">World News</Link>
                  <Link href={createPageUrl("FootballNews")} className="block text-sm hover:text-amber-400 transition-colors">Football News</Link>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Marketplace</h4>
                <div className="space-y-2">
                  <Link href={createPageUrl("MarketplaceCars")} className="block text-sm hover:text-amber-400 transition-colors">Cars</Link>
                  <Link href={createPageUrl("MarketplaceHouses")} className="block text-sm hover:text-amber-400 transition-colors">Houses</Link>
                  <Link href={createPageUrl("MarketplaceLand")} className="block text-sm hover:text-amber-400 transition-colors">Land</Link>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Account</h4>
                <div className="space-y-2">
                  <Link href={createPageUrl("Dashboard")} className="block text-sm hover:text-amber-400 transition-colors">Dashboard</Link>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs">
              © {new Date().getFullYear()} RAYGAL News & Market. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
