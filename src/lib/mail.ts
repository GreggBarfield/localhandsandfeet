// Sends a plain-text email through the SMTP2GO HTTP API (same service the other apps use).
// It never throws: a mail problem must not make a form look like it failed after the row is
// already saved. Returns true only if SMTP2GO accepted the message.
export async function sendMail(opts: { subject: string; text: string; replyTo?: string }): Promise<boolean> {
  const apiKey = process.env.SMTP2GO_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO;
  if (!apiKey || !from || !to) {
    console.error("sendMail skipped: SMTP2GO_API_KEY, MAIL_FROM or MAIL_TO is not set in .env");
    return false;
  }
  const fromName = process.env.MAIL_FROM_NAME || "Local Hands and Feet";
  try {
    const body: Record<string, unknown> = {
      sender: `${fromName} <${from}>`,
      to: [to],
      subject: opts.subject,
      text_body: opts.text,
    };
    if (opts.replyTo) body.custom_headers = [{ header: "Reply-To", value: opts.replyTo }];

    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-Smtp2go-Api-Key": apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    let data: { data?: { succeeded?: number; error?: string; failures?: unknown[] } } = {};
    try {
      data = (await res.json()) as typeof data;
    } catch {
      /* non-JSON body: the status check below covers it */
    }
    if (!res.ok || (data.data?.succeeded ?? 0) < 1) {
      const why = data.data?.error ?? (data.data?.failures?.length ? "recipient rejected" : `HTTP ${res.status}`);
      console.error(`sendMail failed: SMTP2GO did not accept the message: ${why}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendMail failed", err);
    return false;
  }
}

// Turns [question, answer] pairs into email text. Short answers go on the same line,
// long or multi-line answers go underneath. Blank answers show as "(not answered)".
export function questionsAndAnswers(rows: [string, string][]): string {
  return rows
    .map(([q, a]) => {
      const answer = a.trim() || "(not answered)";
      return answer.length > 60 || answer.includes("\n") ? `${q}\n${answer}` : `${q}: ${answer}`;
    })
    .join("\n\n");
}
