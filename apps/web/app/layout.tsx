import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strategy Ledger",
  description: "Reviewed ETF strategy research, methodology, and risk disclosures.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a className="brand" href="/">
            Strategy Ledger
          </a>
          <nav aria-label="Primary navigation">
            <a href="/research">Research</a>
            <a href="/#methodology">Methodology</a>
            <a href="/#risk">Risk</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
