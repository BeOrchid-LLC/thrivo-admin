"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function getStoredCollapsed(): boolean | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split("=")[1]?.trim();
  return value === "true" ? true : value === "false" ? false : null;
}

function writeCollapsedCookie(value: boolean) {
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

/** Desktop sidebar collapsed state, persisted to a cookie. */
export function SidebarProvider({ children }: PropsWithChildren) {
  const [collapsed, setCollapsedState] = useState(() => getStoredCollapsed() ?? false);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    writeCollapsedCookie(value);
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      writeCollapsedCookie(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const value = useMemo<SidebarContextValue>(
    () => ({ collapsed, toggle, setCollapsed }),
    [collapsed, toggle, setCollapsed]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
