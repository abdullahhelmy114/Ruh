"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, BookOpen, User, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/community", label: "Community" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const { user, isLoading, role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };

  const dashboardLink =
    role === "admin"
      ? "/dashboard/admin"
      : role === "teacher"
      ? "/dashboard/teacher"
      : "/dashboard/student";

  const profileLink =
    role === "admin"
      ? "/profile/admin"
      : role === "teacher"
      ? "/profile/teacher"
      : "/profile/student";

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full gradient-emerald shadow-elegant">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold text-foreground">Ruhulqudus</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Academy</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors hover:bg-accent",
                pathname === l.to && "bg-accent text-accent-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 transition hover:bg-accent"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full gradient-emerald text-sm font-bold text-primary-foreground">
                  {initial}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-card p-2 shadow-elegant">
                  <div className="px-3 py-2 text-xs text-muted-foreground">{user.email}</div>
                  <hr className="my-1" />
                  <Link href={dashboardLink} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href={profileLink} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] sm:inline-flex"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}