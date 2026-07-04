"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type PresentonLocale = "en" | "vi";

export const PRESENTON_LOCALE_STORAGE_KEY = "presenton_ui_locale";
export const PRESENTON_LOCALE_MESSAGE_TYPE = "3labs_presenton_locale";
export const LESSON_SLIDE_SEED_MESSAGE_TYPE = "3labs_lesson_slide_seed";

type PresentonI18nContextValue = {
  locale: PresentonLocale;
  setLocale: (locale: PresentonLocale) => void;
};

const PresentonI18nContext = createContext<PresentonI18nContextValue | null>(null);

export function readPresentonLocale(value?: string | null): PresentonLocale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.startsWith("vi") || normalized.includes("tiếng việt") || normalized.includes("vietnamese")) return "vi";
  if (normalized.startsWith("en") || normalized.includes("english")) return "en";
  return null;
}

export function resolvePresentonLocale(value?: string | null, fallback: PresentonLocale = "en"): PresentonLocale {
  return readPresentonLocale(value) ?? fallback;
}

function getUrlLocale(): PresentonLocale | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return (
    readPresentonLocale(params.get("ui_locale")) ??
    readPresentonLocale(params.get("locale")) ??
    readPresentonLocale(params.get("lang"))
  );
}

function getStoredLocale(): PresentonLocale | null {
  if (typeof window === "undefined") return null;
  try {
    return readPresentonLocale(localStorage.getItem(PRESENTON_LOCALE_STORAGE_KEY));
  } catch {
    return null;
  }
}

function getBrowserLocale(): PresentonLocale | null {
  if (typeof navigator === "undefined") return null;
  return readPresentonLocale(navigator.language);
}

function getInitialLocale(): PresentonLocale {
  const urlLocale = getUrlLocale();
  if (urlLocale) return urlLocale;

  return getStoredLocale() ?? getBrowserLocale() ?? "en";
}

function extractMessageLocale(data: unknown): PresentonLocale | null {
  if (typeof data === "string") return readPresentonLocale(data);
  if (!data || typeof data !== "object") return null;

  const message = data as {
    type?: unknown;
    uiLocale?: unknown;
    locale?: unknown;
    lang?: unknown;
    payload?: unknown;
  };

  const direct =
    typeof message.uiLocale === "string"
      ? message.uiLocale
      : typeof message.locale === "string"
        ? message.locale
        : typeof message.lang === "string"
          ? message.lang
          : null;
  const directLocale = readPresentonLocale(direct);
  if (directLocale) return directLocale;

  if (message.payload && typeof message.payload === "object") {
    const payload = message.payload as {
      uiLocale?: unknown;
      locale?: unknown;
      lang?: unknown;
    };
    const payloadValue =
      typeof payload.uiLocale === "string"
        ? payload.uiLocale
        : typeof payload.locale === "string"
          ? payload.locale
          : typeof payload.lang === "string"
            ? payload.lang
            : null;
    return readPresentonLocale(payloadValue);
  }

  return null;
}

export function PresentonI18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<PresentonLocale>(getInitialLocale);

  const setLocale = useCallback((nextLocale: PresentonLocale) => {
    setLocaleState(nextLocale);
    try {
      localStorage.setItem(PRESENTON_LOCALE_STORAGE_KEY, nextLocale);
    } catch {
      // Storage can be unavailable in embedded/private contexts.
    }
    document.documentElement.lang = nextLocale;
    document.documentElement.dataset.presentonLocale = nextLocale;
  }, []);

  useEffect(() => {
    setLocale(locale);
  }, [locale, setLocale]);

  useEffect(() => {
    const urlLocale = getUrlLocale();
    if (urlLocale) setLocale(urlLocale);
  }, [setLocale]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const nextLocale = extractMessageLocale(event.data);
      if (nextLocale) setLocale(nextLocale);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key !== PRESENTON_LOCALE_STORAGE_KEY) return;
      const nextLocale = readPresentonLocale(event.newValue);
      if (nextLocale) setLocale(nextLocale);
    }

    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [setLocale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <PresentonI18nContext.Provider value={value}>{children}</PresentonI18nContext.Provider>;
}

export function usePresentonI18n() {
  const context = useContext(PresentonI18nContext);
  if (!context) {
    throw new Error("usePresentonI18n must be used within PresentonI18nProvider");
  }
  return context;
}
