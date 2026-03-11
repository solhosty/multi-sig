import type { Metadata } from "next";
import Link from "next/link";
import { Manrope } from "next/font/google";

import "@/app/globals.css";
import { AppToaster } from "@/components/app-toaster";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Web3Provider } from "@/components/providers/web3-provider";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Solhosty Multi-Sig Studio",
  description: "Premium factory-first multi-sig workflows for Sepolia wallets"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <Web3Provider>
          <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
              <div className="flex items-center gap-6">
                <Link className="text-base font-semibold tracking-tight" href="/wallets">
                  Solhosty Multi-Sig
                </Link>
                <nav className="hidden items-center gap-2 text-sm md:flex">
                  <Link className="copy-pill" href="/wallets">
                    Discover
                  </Link>
                  <Link className="copy-pill" href="/wallets/new">
                    Create
                  </Link>
                  <Link className="copy-pill" href="/wallets/import">
                    Import
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <Link className="btn-secondary px-3 py-2 text-sm" href="/">
                  Home
                </Link>
                <ConnectWalletButton />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl p-4 md:p-6">{children}</main>
          <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2 text-xs subtle-text md:px-6">
            Built for collaborative Sepolia treasury ops
          </footer>
          <AppToaster />
        </Web3Provider>
      </body>
    </html>
  );
}
