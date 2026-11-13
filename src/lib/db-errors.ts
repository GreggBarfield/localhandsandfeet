// Postgres code 23505 = unique constraint violated (for example, an email already in use).
export function isUniqueViolation(e: unknown): boolean {
  const code = (x: unknown) => (typeof x === "object" && x !== null && "code" in x ? (x as { code?: unknown }).code : undefined);
  const cause = typeof e === "object" && e !== null && "cause" in e ? (e as { cause?: unknown }).cause : undefined;
  return code(e) === "23505" || code(cause) === "23505";
}
