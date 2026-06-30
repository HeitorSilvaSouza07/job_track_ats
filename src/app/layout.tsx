import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATS Resume Optimizer",
  description: "Analyze, optimize and export resumes for ATS compatibility."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="text-sm font-semibold tracking-tight text-slate-950">
                ATS Resume Optimizer
              </Link>
              <nav className="flex items-center gap-4 text-sm text-slate-600">
                <Link href="/" className="hover:text-slate-950">
                  Analisar
                </Link>
                <Link href="/dashboard" className="hover:text-slate-950">
                  Dashboard
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
