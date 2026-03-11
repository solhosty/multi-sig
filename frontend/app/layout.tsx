import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";
import { AppToaster } from "@/components/app-toaster";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Web3Provider } from "@/components/providers/web3-provider";

export const metadata: Metadata = {
  title: "Solhosty Multi-Sig",
  description: "Factory-first multi-sig dashboard for Sepolia"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/80">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
              <Link className="text-lg font-semibold" href="/">
                Solhosty Multi-Sig
              </Link>
              <ConnectWalletButton />
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
          <AppToaster />
        </Web3Provider>
      </body>
    </html>
  );
}
