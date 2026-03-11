"use client";

import { useMemo } from "react";
import { toast } from "sonner";

type Props = {
  walletAddress: `0x${string}`;
};

export const ShareWalletLink = ({ walletAddress }: Props) => {
  const link = useMemo(() => {
    if (typeof window === "undefined") {
      return `/wallets/${walletAddress}/dashboard`;
    }
    return `${window.location.origin}/wallets/${walletAddress}/dashboard`;
  }, [walletAddress]);

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide">Share Wallet</h3>
      <p className="mt-2 break-all text-xs text-slate-600 dark:text-slate-300">{link}</p>
      <button
        className="mt-3 rounded-md border border-[hsl(var(--border))] px-3 py-2 text-sm"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          toast.success("Wallet link copied");
        }}
        type="button"
      >
        Copy Invite Link
      </button>
    </div>
  );
};
