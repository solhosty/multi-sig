"use client";

import { useWalletTransactions } from "@/lib/hooks/use-wallet-transactions";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Props = {
  walletAddress: `0x${string}`;
};

export const WalletTransactionHistory = ({ walletAddress }: Props) => {
  const { transactions, isLoading } = useWalletTransactions(walletAddress);

  if (isLoading) {
    return (
      <div className="grid gap-3">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="panel p-4 md:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide">Scoped Transaction History</h3>
      <div className="mt-3 space-y-2 text-xs">
        {transactions.map((tx) => (
          <div className="surface-muted p-3" key={tx.id.toString()}>
            <p>#{tx.id.toString()}</p>
            <p className="break-all font-mono">to {tx.to}</p>
            <p className="subtle-text">{tx.executed ? "Executed" : "Pending approval"}</p>
          </div>
        ))}
        {transactions.length === 0 ? <p className="subtle-text">No records for this wallet route.</p> : null}
      </div>
    </div>
  );
};
