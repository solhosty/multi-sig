"use client";

import Link from "next/link";
import { useAccount } from "wagmi";

import { useMultisig } from "@/lib/hooks/use-multisig";

type Props = {
  walletAddress: `0x${string}`;
};

export const WalletCard = ({ walletAddress }: Props) => {
  const { address } = useAccount();
  const { owners, threshold, transactionCount } = useMultisig(walletAddress);

  const ownerList = (owners.data ?? []) as `0x${string}`[];
  const isOwner = address
    ? ownerList.some((owner) => owner.toLowerCase() === address.toLowerCase())
    : false;

  return (
    <article className="panel space-y-4 p-5 transition hover:-translate-y-1">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Wallet</p>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            isOwner
              ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
          }`}
        >
          {isOwner ? "Owner" : "Viewer"}
        </span>
      </div>

      <p className="break-all font-mono text-xs subtle-text">{walletAddress}</p>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="surface-muted p-2">
          <p className="subtle-text">Owners</p>
          <p className="mt-1 text-sm font-semibold">{ownerList.length}</p>
        </div>
        <div className="surface-muted p-2">
          <p className="subtle-text">Threshold</p>
          <p className="mt-1 text-sm font-semibold">{(threshold.data ?? 0n).toString()}</p>
        </div>
        <div className="surface-muted p-2">
          <p className="subtle-text">Txs</p>
          <p className="mt-1 text-sm font-semibold">{(transactionCount.data ?? 0n).toString()}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link className="btn-primary px-3 py-2 text-xs" href={`/wallets/${walletAddress}/dashboard`}>
          Open Dashboard
        </Link>
        <Link className="btn-secondary px-3 py-2 text-xs" href={`/wallets/${walletAddress}/send`}>
          Send Flow
        </Link>
      </div>
    </article>
  );
};
