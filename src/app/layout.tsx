import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Hands & Feet - Christian Service Projects",
  description:
    "Sharing the Love of Christ by creating local partnerships between volunteers and those in need.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
