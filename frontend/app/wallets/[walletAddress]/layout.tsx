"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useIsValidWallet } from "@/lib/hooks/use-validate-wallet";

type Props = {
  children: ReactNode;
  params: {
    walletAddress: `0x${string}`;
  };
};

export default function WalletAddressLayout({ children, params }: Props) {
  const walletAddress = params.walletAddress;
  const { isValid, isLoading } = useIsValidWallet(walletAddress);

  if (isLoading) {
    return (
      <section className="space-y-4 py-6">
        <div className="panel space-y-3 p-6 md:p-8">
          <div className="h-5 w-44 animate-pulse rounded bg-[hsl(var(--muted))]" />
          <div className="h-4 w-full animate-pulse rounded bg-[hsl(var(--muted))]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-[hsl(var(--muted))]" />
        </div>
      </section>
    );
  }

  if (!isValid) {
    return (
      <section className="space-y-4 py-6">
        <div className="panel space-y-4 p-6 md:p-8">
          <h1 className="text-2xl font-semibold">Wallet Not Found</h1>
          <p className="subtle-text">This address is not a recognized multisig wallet</p>
          <Link className="button-secondary inline-flex" href="/wallets">
            Back to Wallets
          </Link>
        </div>
      </section>
    );
  }

  return children;
}
