"use client";

import type { ReactNode } from "react";

import { LoadingSkeleton } from "@/components/loading-skeleton";
import { useValidatedWallet } from "@/lib/hooks/use-validated-wallet";

type Props = {
  children: ReactNode;
  params: {
    walletAddress: string;
  };
};

export default function WalletLayout({ children, params }: Props) {
  const { isValidating, isValidWallet } = useValidatedWallet(params.walletAddress);

  if (isValidating) {
    return (
      <section className="space-y-4 py-6">
        <LoadingSkeleton className="h-12 w-56" />
        <LoadingSkeleton className="h-48 w-full" />
      </section>
    );
  }

  if (!isValidWallet) {
    return (
      <section className="py-6">
        <div className="panel space-y-2 p-6">
          <h1 className="text-2xl font-semibold">Wallet not found</h1>
          <p className="text-sm subtle-text">
            This wallet address is not registered in the MultiSig factory.
          </p>
        </div>
      </section>
    );
  }

  return children;
}
