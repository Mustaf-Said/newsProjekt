"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPageUrl } from "@/utils";
import { supabase } from "@/api/supabaseClient";
import {
  Home, Newspaper, Trophy, ShoppingBag,
  User, LogOut, Menu, X, ChevronDown, Sun, Moon,
  LayoutDashboard, Shield,
  Fullscreen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const pathname = usePathname();

  const pathSegment = pathname === "/" ? "Home" : pathname.replace(/^\//, "").split("/")[0];

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async (currentUser: any) => {
      if (!currentUser) {
        setProfile(null);
        setIsLoadingProfile(false);
        setProfileError(null);
        return;
      }

      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, email")
          .eq("id", currentUser.id)
          .single();

        if (error || !data) {
          // Profile doesn't exist - user is not registered
          console.warn("⚠️ User authenticated but profile not found:", currentUser.email);
          setProfileError("This user is not a member. Please create an account to log in.");

          // Sign out the user automatically
          await supabase.auth.signOut();

          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
          setIsLoadingProfile(false);
          return;
        }

        if (isMounted) {
          console.log("✅ Profile loaded:", data.full_name, `(${data.role})`);
          setProfile(data);
        }
      } catch (err) {
        console.error("Profile load error:", err);
        setProfileError("Error loading profile. Please try again.");
        await supabase.auth.signOut();
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (error) {
        setUser(null);
        setProfile(null);
        setIsLoadingProfile(false);
        return;
      }
      setUser(data.user || null);
      await loadProfile(data.user);
    };

    loadUser();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      loadProfile(session?.user || null);
    });

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
      authListener.subscription.unsubscribe();
    };
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
        { label: "Other", page: "MarketplaceOther" },
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
        {profileError && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 px-4 py-3 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{profileError}</p>
              </div>
              <button
                onClick={() => setProfileError(null)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-[var(--navy)] text-white/80 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="hover:text-[var(--accent)] transition-colors">
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <span>Welcome, {profile?.full_name || user?.email || "Guest"} {profile?.role && `(${profile.role})`}</span>
            </div>
          </div>
        </div>

        <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[var(--bg-primary)]/95 backdrop-blur-xl shadow-lg" : "bg-[var(--bg-primary)] shadow-sm"}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16 ">
              <Link href={createPageUrl("Home")} className="flex items-center h-full">

                <Image
                  src={"/logo22.png"}
                  width={100}
                  height={100}
                  className="md:h-40 w-auto object-contain drop-shadow-sm mt-3 py-4"
                  priority
                  alt="RaygalRoyal Logo"
                />
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
                <div id="weglot_here"></div>
              </nav>

              <div className="flex items-center gap-2">
                {user && profile?.role?.toLowerCase().trim() === "admin" && (
                  <Link href={createPageUrl("AdminPanel")}>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Admin Panel"
                      className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                    >
                      <Shield className="w-4.5 h-4.5" />
                    </Button>
                  </Link>
                )}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <User className="w-4.5 h-4.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold">{profile?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={createPageUrl("Dashboard")} className="cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      {profile?.role?.toLowerCase().trim() === "admin" && (
                        <DropdownMenuItem asChild>
                          <Link href={createPageUrl("AdminPanel")} className="cursor-pointer">
                            <Shield className="w-4 h-4 mr-2" /> Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => supabase.auth.signOut()}
                        className="text-red-600 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Sign In"
                    className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                    onClick={() => {
                      // Open Supabase auth
                      window.location.href = "/auth";
                    }}
                  >
                    <User className="w-4.5 h-4.5" />
                  </Button>
                )}

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
                <div id="weglot_here"></div>
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
                  <span className="text-white text-lg font-black">
                    <Link
                      href={"/"}
                      className="hover:text-amber-400 transition-colors">
                      RaygalRoyal
                    </Link>
                  </span>
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
                  <Link href={createPageUrl("MarketplaceOther")} className="block text-sm hover:text-amber-400 transition-colors">Other</Link>
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
              © {new Date().getFullYear()} <Link href={"https://raygalroyal.vercel.app/"} target="_blank" className=" hover:text-amber-400 font-bold">RaygalRoyal</Link> News & Market. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
