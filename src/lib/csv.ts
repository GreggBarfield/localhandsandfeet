export type CsvCell = string | number | boolean | Date | null | undefined;

function escapeCell(v: CsvCell): string {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  // Stops spreadsheet programs from running a cell as a formula (a cell starting with =, @, or +/- plus a letter).
  if (/^[=@\t\r]/.test(s) || /^[+-][^\d\s(.]/.test(s)) s = `'${s}`;
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

// The leading BOM makes Excel open the file as UTF-8, so names with accents show correctly.
export function toCsv(headers: string[], rows: CsvCell[][]): string {
  return "﻿" + [headers, ...rows].map((r) => r.map(escapeCell).join(",")).join("\r\n") + "\r\n";
}
