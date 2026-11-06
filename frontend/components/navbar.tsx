"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { logoutAction } from "@/actions/auth.actions";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
import {
  IconNotebook,
  IconArticle,
  IconChartBar,
  IconShield,
  IconSun,
  IconMoon,
  IconLogout,
  IconMenu2,
  IconX,
  IconPlus
} from "@tabler/icons-react";

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  const navLinks = [
    { href: "/", label: "Notes", icon: IconNotebook, authRequired: true },
    { href: "/posts", label: "Public Posts", icon: IconArticle, authRequired: false },
    { href: "/aggregations", label: "Aggregations", icon: IconChartBar, authRequired: false },
    ...(user?.role === "admin"
      ? [{ href: "/admin", label: "Admin Panel", icon: IconShield, authRequired: true }]
      : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-muted bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
              <IconNotebook className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary">
              SecureNotes
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-muted bg-card text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
          >
            <IconSun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <IconMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-muted">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-primary leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {user.role === "admin" ? (
                    <span className="text-amber-500 font-bold">Admin</span>
                  ) : (
                    "User"
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg border border-muted bg-card px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <IconLogout className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-secondary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-xs transition-opacity"
              >
                Get Started
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-muted text-muted-foreground hover:bg-secondary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-muted bg-card px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            if (link.authRequired && !user) return null;
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-secondary text-primary font-semibold"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <div className="pt-3 border-t border-muted mt-2 space-y-2">
              <div className="px-3 text-xs text-muted-foreground">
                Signed in as <span className="font-semibold text-primary">{user.email}</span> ({user.role})
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
              >
                <IconLogout className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-muted mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-md border border-muted py-2 text-xs font-semibold text-primary hover:bg-secondary"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

