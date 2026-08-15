import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "PROMESA | Donation campaign management",
  description: "Transparent SDG donation campaigns for NGOs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              className="text-lg font-black tracking-tight text-slate-950"
              href="/"
            >
              PROM<span className="text-teal-700">ESA</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                className="hidden px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 sm:block"
                href="/campaigns"
              >
                Campaigns
              </Link>
              <Link className="button button-outline" href="/login">
                Sign in
              </Link>
              <Link className="button button-primary" href="/register">
                Get started
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-7 text-sm text-slate-500 sm:flex-row">
            <p>© 2026 PROMESA. Transparent pledges for SDG action.</p>
            <p>Pledges are commitments, not payment transactions.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
