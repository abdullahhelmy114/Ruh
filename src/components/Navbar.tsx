"use client";

import { T } from "@/components/TranslatedText";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, BellOff, Mail, Moon, Sun, BookOpen, User, LayoutDashboard, LogOut, ChevronDown,
  Info, Phone, Shield, ShoppingCart, Heart,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { signOut, getAuth } from "firebase/auth";

// روابط أساسية للجميع
const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/community", label: "Community" },
];

// روابط خاصة بالطلاب (تظهر للطلاب وغير المسجلين)
const studentLinks = [
  { to: "/bundles", label: "Bundles" },
  { to: "/assessments", label: "Assessments" },
  { to: "/affiliate", label: "Affiliate" },
];

// روابط خاصة بالمعلمين (تظهر للمعلمين وغير المسجلين)
const teacherLinks = [
  { to: "/certification", label: "Certification" },
];

// روابط عامة تظهر في قائمة "More"
const moreLinks = [
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Phone },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const { user, isLoading, role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // بناء قائمة الروابط الرئيسية حسب الدور
  const links = [...baseLinks];
  if (!role || role === "student") {
    links.push(...studentLinks);
  }
  if (!role || role === "teacher") {
    links.push(...teacherLinks);
  }

  // جلب الإشعارات كل 30 ثانية
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = () => {
      fetch(`/api/notifications?uid=${user.uid}`)
        .then(r => r.json())
        .then(d => setNotifications(d.notifications || []));
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // تحديث عدد الرسائل والسلة والإشعارات
  useEffect(() => {
    if (!user) return;
    const updateUnread = () =>
      fetch(`/api/messages/unread-count?uid=${user.uid}`)
        .then((r) => r.json())
        .then((d) => setUnreadMessages(d.count || 0));
    const updateCart = () =>
      fetch(`/api/cart?uid=${user.uid}`)
        .then(r => r.json())
        .then(d => setCartCount(d.items?.length || 0));
    const checkFcm = () =>
      fetch(`/api/user?uid=${user.uid}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.profile?.fcm_token) setNotificationsEnabled(true);
        });
    updateUnread();
    updateCart();
    checkFcm();
    const interval = setInterval(() => { updateUnread(); updateCart(); }, 60000);
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
        setNotifOpen(false);
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

          {/* زر تفعيل إشعارات المتصفح */}
          {user && !notificationsEnabled && (
            <button
              onClick={enableNotifications}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
              title="Enable Notifications"
            >
              <BellOff className="h-4 w-4 text-muted-foreground" />
            </button>
          )}

          {/* قائمة الإشعارات المنبثقة */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
            >
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl border bg-card p-2 shadow-elegant z-50">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <T>Notifications</T>
                </div>
                {notifications.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-center text-muted-foreground">
                    <T>No notifications yet</T>
                  </p>
                ) : (
                  notifications.map(n => (
                    <Link
                      key={n.id}
                      href={n.link || '#'}
                      onClick={() => setNotifOpen(false)}
                      className={`block rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent ${
                        !n.read ? 'border-l-2 border-l-amber-500 bg-amber-500/5' : ''
                      }`}
                    >
                      <p className={!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          {/* أيقونة الرسائل */}
          <Link
            href="/messages"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
          >
            <Mail className="h-4 w-4" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </Link>

          {/* زر الوضع الليلي */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* حالة المستخدم */}
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
                  <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200">
                    <Heart className="h-4 w-4" /> <T>Wishlist</T>
                  </Link>
                  <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-emerald-900 dark:hover:text-emerald-200">
                    <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> <T>Cart</T></span>
                    {cartCount > 0 && (
                      <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{cartCount}</span>
                    )}
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