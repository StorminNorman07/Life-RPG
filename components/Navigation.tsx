"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type AccountSummary = {
  username: string;
  displayName: string;
};

type NavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: string;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Stats",
    shortLabel: "Stats",
    icon: "📊",
  },
  {
    href: "/daily-tasks",
    label: "Daily Tasks",
    shortLabel: "Daily",
    icon: "✅",
  },
  {
    href: "/skill-tree",
    label: "Skill Tree",
    shortLabel: "Skills",
    icon: "🌳",
  },
  {
    href: "/calendar",
    label: "Calendar",
    shortLabel: "Calendar",
    icon: "📅",
  },
  {
    href: "/friends",
    label: "Friends",
    shortLabel: "Friends",
    icon: "👥",
  },
  {
    href: "/budget",
    label: "Budget",
    shortLabel: "Budget",
    icon: "💰",
  },
  {
    href: "/achievements",
    label: "Achievements",
    shortLabel: "Awards",
    icon: "🏆",
  },
  {
    href: "/focus",
    label: "Focus",
    shortLabel: "Focus",
    icon: "🎯",
  },
  {
    href: "/shop",
    label: "Item Shop",
    shortLabel: "Shop",
    icon: "🛍️",
  },
];

const hiddenNavigationRoutes = [
  "/login",
  "/signup",
  "/settings",
];

function isRouteActive(
  pathname: string,
  href: string
) {
  return href === "/"
    ? pathname === "/"
    : pathname === href ||
        pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const pathname = usePathname();

  const [account, setAccount] =
    useState<AccountSummary | null>(null);

  const [loadingAccount, setLoadingAccount] =
    useState(true);

  const hideNavigation =
    hiddenNavigationRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`)
    );

  const activeItem =
    navigationItems.find((item) =>
      isRouteActive(pathname, item.href)
    ) ?? navigationItems[0];

  useEffect(() => {
    if (hideNavigation) {
      return;
    }

    const route = navigationItems.find(
      (item) =>
        isRouteActive(pathname, item.href)
    )?.href;

    if (!route) {
      return;
    }

    const visited = new Set<string>(
      JSON.parse(
        localStorage.getItem(
          "lifeRpgVisitedTabs"
        ) ?? "[]"
      )
    );

    visited.add(route);

    localStorage.setItem(
      "lifeRpgVisitedTabs",
      JSON.stringify([...visited])
    );

    window.dispatchEvent(
      new CustomEvent("achievement-metric", {
        detail: {
          metric: "appTabsVisited",
          value: visited.size,
          mode: "set",
        },
      })
    );
  }, [pathname, hideNavigation]);

  useEffect(() => {
    if (hideNavigation) {
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      if (!user) {
        setAccount(null);
        setLoadingAccount(false);
        return;
      }

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("username, display_name")
          .eq("id", user.id)
          .single();

      if (cancelled) {
        return;
      }

      const nextAccount = profile
        ? {
            username: profile.username,
            displayName:
              profile.display_name,
          }
        : null;

      setAccount(nextAccount);

      if (nextAccount) {
        localStorage.setItem(
          "account-profile-cache",
          JSON.stringify(nextAccount)
        );
      } else {
        localStorage.removeItem(
          "account-profile-cache"
        );
      }

      setLoadingAccount(false);
    }

    function handleProfileUpdated(
      event: Event
    ) {
      const detail = (
        event as CustomEvent<{
          username?: string;
          displayName?: string;
        }>
      ).detail;

      if (detail) {
        setAccount((old) => ({
          username:
            detail.username ??
            old?.username ??
            "",
          displayName:
            detail.displayName ??
            old?.displayName ??
            "",
        }));
      } else {
        void loadAccount();
      }
    }

    function handleStoredProfileUpdate(
      event: StorageEvent
    ) {
      if (
        event.key !==
          "account-profile-cache" ||
        !event.newValue
      ) {
        return;
      }

      try {
        setAccount(
          JSON.parse(
            event.newValue
          ) as AccountSummary
        );
      } catch {
        void loadAccount();
      }
    }

    const cached = localStorage.getItem(
      "account-profile-cache"
    );

    if (cached) {
      try {
        const cachedAccount = JSON.parse(
          cached
        ) as AccountSummary;

        window.setTimeout(() => {
          if (cancelled) {
            return;
          }

          setAccount(cachedAccount);
          setLoadingAccount(false);
        }, 0);
      } catch {
        // A malformed cache should not block
        // the fresh profile request below.
      }
    }

    void loadAccount();

    window.addEventListener(
      "account-profile-updated",
      handleProfileUpdated
    );

    window.addEventListener(
      "storage",
      handleStoredProfileUpdate
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      () => {
        void loadAccount();
      }
    );

    return () => {
      cancelled = true;

      window.removeEventListener(
        "account-profile-updated",
        handleProfileUpdated
      );

      window.removeEventListener(
        "storage",
        handleStoredProfileUpdate
      );

      subscription.unsubscribe();
    };
  }, [hideNavigation]);

  if (hideNavigation) {
    return null;
  }

  return (
    <>
      {/* Mobile app bar */}
      <header className="mobile-app-header md:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            Life RPG
          </p>

          <h1 className="mt-0.5 truncate text-lg font-black text-white">
            {activeItem.icon} {activeItem.label}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {loadingAccount ? (
            <div className="h-10 w-10 animate-pulse rounded-2xl bg-zinc-900" />
          ) : account ? (
            <Link
              href={`/settings?from=${encodeURIComponent(pathname)}`}
              aria-label="Open settings"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950 text-lg shadow-lg shadow-black/30 active:scale-95"
            >
              ⚙️
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-black text-black active:scale-95"
            >
              Log in
            </Link>
          )}
        </div>
      </header>

      {/* Desktop navigation */}
      <nav className="hidden w-full bg-black/90 px-4 py-4 text-white backdrop-blur-xl md:block">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const active = isRouteActive(
                pathname,
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-zinc-950 text-zinc-300 hover:border-white/25 hover:bg-zinc-900"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {loadingAccount ? (
              <div className="h-10 w-36 animate-pulse rounded-xl bg-zinc-900" />
            ) : account ? (
              <>
                <div className="hidden min-w-0 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 sm:block">
                  <p className="max-w-40 truncate text-sm font-black">
                    {account.displayName}
                  </p>

                  <p className="max-w-40 truncate text-xs text-zinc-500">
                    @{account.username}
                  </p>
                </div>

                <Link
                  href={`/settings?from=${encodeURIComponent(pathname)}`}
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-white/25 hover:bg-zinc-900 hover:text-white"
                >
                  ⚙️ Settings
                </Link>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-sm font-bold"
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-black text-black"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav
        className="mobile-bottom-nav md:hidden"
        aria-label="Primary navigation"
      >
        <div className="mobile-bottom-nav-scroll">
          {navigationItems.map((item) => {
            const active = isRouteActive(
              pathname,
              item.href
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  active ? "page" : undefined
                }
                className={`mobile-nav-item ${
                  active
                    ? "mobile-nav-item-active"
                    : ""
                }`}
              >
                <span className="text-xl leading-none">
                  {item.icon}
                </span>

                <span className="mt-1 text-[10px] font-black leading-none">
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
