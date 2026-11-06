"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { logoutAction } from "@/actions/auth.actions";
import { useTheme } from "next-themes";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconNotebook,
  IconArticle,
  IconChartBar,
  IconShield,
  IconSun,
  IconMoon,
  IconLogout,
  IconMenu2,
  IconX
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
    { href: "/posts", label: "Public Feed", icon: IconArticle, authRequired: false },
    { href: "/aggregations", label: "Aggregations", icon: IconChartBar, authRequired: false },
    ...(user?.role === "admin"
      ? [{ href: "/admin", label: "User Management", icon: IconShield, authRequired: true }]
      : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
              <IconNotebook className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              SecureNotes
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              if (link.authRequired && !user) return null;
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2 font-medium"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="rounded-lg border-border"
          >
            <IconSun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
            <IconMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
          </Button>

          {user ? (
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-foreground leading-tight">
                  {user.name}
                </span>
                <div className="flex items-center justify-end mt-0.5">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className="h-4 px-1.5 text-[9px] uppercase tracking-wider font-bold"
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                disabled={isPending}
                className="gap-1.5"
              >
                <IconLogout className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <IconX className="h-4 w-4" /> : <IconMenu2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pt-3 pb-4 space-y-2">
          {navLinks.map((link) => {
            if (link.authRequired && !user) return null;
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block"
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2.5"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
          {user ? (
            <div className="pt-3 border-t border-border mt-3 space-y-2">
              <div className="px-1 text-xs text-muted-foreground flex items-center justify-between">
                <span>{user.email}</span>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                onClick={handleLogout}
                disabled={isPending}
              >
                <IconLogout className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-border mt-3 grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
