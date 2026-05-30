"use client";

import { T } from "@/components/TranslatedText";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, BellOff, Mail, Moon, Sun, BookOpen, User, LayoutDashboard, LogOut, ChevronDown,
  Info, Phone, Package, Shield,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { signOut, getAuth } from "firebase/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/bundles", label: "Bundles" },
  { to: "/community", label: "Community" },
];

const moreLinks = [
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Phone },
  { to: "/certification", label: "Certification", icon: Shield },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const { user, isLoading, role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // تحديث عدد الرسائل غير المقروءة كل دقيقة + حالة الإشعارات
  useEffect(() => {
    if (!user) return;
    const updateUnread = () =>
      fetch(`/api/messages/unread-count?uid=${user.uid}`)
        .then((r) => r.json())
        .then((d) => setUnreadMessages(d.count || 0));
    const checkFcm = () =>
      fetch(`/api/user?uid=${user.uid}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.profile?.fcm_token) setNotificationsEnabled(true);
        });
    updateUnread();
    checkFcm();
    const interval = setInterval(updateUnread, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const enableNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const { getMessaging, getToken } = await import("firebase/messaging");
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      });
      if (token) {
        await fetch("/api/notifications/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user!.uid, token }),
        });
        setNotificationsEnabled(true);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(getAuth());
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
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full gradient-emerald shadow-elegant">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold text-foreground">
              <T>Ruhulqudus</T>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold">
              <T>Academy</T>
            </div>
          </div>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200",
                pathname === l.to && "bg-accent text-accent-foreground"
              )}
            >
              <T>{l.label}</T>
            </Link>
          ))}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200 flex items-center gap-1",
                moreOpen && "bg-accent text-accent-foreground"
              )}
            >
              <T>More</T>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card p-2 shadow-elegant">
                {moreLinks.map((l) => {
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.to}
                      href={l.to}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200"
                    >
                      <Icon className="h-4 w-4" />
                      <T>{l.label}</T>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {user && !notificationsEnabled && (
            <button
              onClick={enableNotifications}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
              title="Enable Notifications"
            >
              <BellOff className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          <Link
            href="/messages"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
          >
            <Mail className="h-4 w-4" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 transition hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200"
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
                  <Link href={dashboardLink} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200">
                    <LayoutDashboard className="h-4 w-4" /> <T>Dashboard</T>
                  </Link>
                  <Link href={profileLink} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200">
                    <User className="h-4 w-4" /> <T>Profile</T>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <LogOut className="h-4 w-4" /> <T>Sign out</T>
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
                <T>Sign in</T>
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] sm:inline-flex"
              >
                <T>Sign up</T>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}