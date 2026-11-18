"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: { sitekey: string }) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};
type TurnstileWindow = Window & { turnstile?: TurnstileApi };

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Loads Cloudflare's script once for the whole site. Resolves to null if it cannot load.
function loadTurnstile(): Promise<TurnstileApi | null> {
  const existing = (window as TurnstileWindow).turnstile;
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve) => {
    let script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.dataset.turnstile = "1";
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve((window as TurnstileWindow).turnstile ?? null));
    script.addEventListener("error", () => resolve(null));
  });
}

// Goes inside every public form. Carries the signed page-load stamp and, when Turnstile keys are
// set in .env, shows the Cloudflare check. Turnstile is started only after the page is running in
// the browser, and every Turnstile call is wrapped, so a Turnstile problem can never break the page.
// If the check does not appear, the form is simply refused by the server with a friendly message.
export function FormProtection({
  formToken,
  turnstileSiteKey,
  answer,
}: {
  formToken: string;
  turnstileSiteKey: string;
  answer: unknown;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const firstAnswer = useRef(true);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    let cancelled = false;
    loadTurnstile().then((ts) => {
      if (cancelled || !ts || !box.current) return;
      try {
        widgetId.current = ts.render(box.current, { sitekey: turnstileSiteKey });
      } catch (err) {
        console.error("Turnstile could not start", err);
      }
    });
    return () => {
      cancelled = true;
      try {
        if (widgetId.current) (window as TurnstileWindow).turnstile?.remove(widgetId.current);
      } catch {
        /* nothing to clean up */
      }
      widgetId.current = null;
    };
  }, [turnstileSiteKey]);

  // A Turnstile check can only be used once, so get a fresh one after each reply from the server.
  useEffect(() => {
    if (firstAnswer.current) {
      firstAnswer.current = false;
      return;
    }
    try {
      if (widgetId.current) (window as TurnstileWindow).turnstile?.reset(widgetId.current);
    } catch {
      /* the next submit will ask for a new check */
    }
  }, [answer]);

  return (
    <>
      <input type="hidden" name="form_token" value={formToken} />
      {turnstileSiteKey && <div ref={box} />}
    </>
  );
}
