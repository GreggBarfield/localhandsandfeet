import { createHmac, timingSafeEqual } from "node:crypto";

// Anti-bot helpers for public forms.

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set in .env (at least 32 characters)");
  return s;
}

function sign(ts: string): string {
  return createHmac("sha256", secret()).update(`form-token:${ts}`).digest("base64url");
}

// A signed "page was loaded at this time" stamp. The form carries it back when it is submitted.
export function makeFormToken(): string {
  const ts = String(Date.now());
  return `${ts}.${sign(ts)}`;
}

const MIN_FILL_MS = 3_000; // faster than this is a script, not a person
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function checkFormToken(token: string): "ok" | "missing" | "too_fast" | "expired" {
  const [ts, sig] = token.split(".");
  if (!ts || !sig || !/^\d+$/.test(ts)) return "missing";
  const want = Buffer.from(sign(ts));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return "missing";
  const age = Date.now() - Number(ts);
  if (age < MIN_FILL_MS) return "too_fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}

export function countLinks(text: string): number {
  return (text.match(/https?:\/\/|www\./gi) ?? []).length;
}

// Cloudflare Turnstile. Only checked when TURNSTILE_SECRET_KEY is set in .env.
export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  const key = process.env.TURNSTILE_SECRET_KEY;
  if (!key) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: key, response: token }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("verifyTurnstile failed", err);
    return false;
  }
}

// Everything a page needs to hand to <FormProtection>.
export function getFormProtection() {
  return { formToken: makeFormToken(), turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "" };
}

// One call per form submission. Returns a message to show the visitor, or null when they pass.
export async function checkHuman(fd: FormData): Promise<string | null> {
  const stamp = checkFormToken(String(fd.get("form_token") ?? ""));
  if (stamp === "too_fast") return "That was very fast. Please wait a moment and press Submit again.";
  if (stamp !== "ok") return "This page has expired. Please reload the page and try again.";
  if (!(await verifyTurnstile(String(fd.get("cf-turnstile-response") ?? "")))) {
    return "We could not confirm you are a person. Please try again.";
  }
  return null;
}

export const TOO_MANY = "We have received a lot of submissions from this form. Please try again later, or call us.";
export const LINKS_MESSAGE = "Please leave out web links, or include no more than two.";
