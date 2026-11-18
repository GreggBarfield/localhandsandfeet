"use client";

import Script from "next/script";
import { useEffect } from "react";

type TurnstileWindow = Window & { turnstile?: { reset: () => void } };

// Goes inside every public form. Carries the signed page-load stamp and, when Turnstile keys are
// set in .env, shows the Cloudflare check. "answer" is the form's state, so the check is renewed
// after each reply from the server (a Turnstile check can only be used once).
export function FormProtection({
  formToken,
  turnstileSiteKey,
  answer,
}: {
  formToken: string;
  turnstileSiteKey: string;
  answer: unknown;
}) {
  useEffect(() => {
    (window as TurnstileWindow).turnstile?.reset();
  }, [answer]);

  return (
    <>
      <input type="hidden" name="form_token" value={formToken} />
      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
        </>
      )}
    </>
  );
}
