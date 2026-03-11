"use client";

import { useWalletTransactions } from "@/lib/hooks/use-wallet-transactions";

type Props = {
  walletAddress: `0x${string}`;
};

export const WalletTransactionHistory = ({ walletAddress }: Props) => {
  const { transactions } = useWalletTransactions(walletAddress);

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide">Scoped Transaction History</h3>
      <div className="mt-3 space-y-2 text-xs">
        {transactions.map((tx) => (
          <div className="rounded-md border border-[hsl(var(--border))] p-2" key={tx.id.toString()}>
            <p>#{tx.id.toString()}</p>
            <p className="font-mono">to {tx.to}</p>
            <p>{tx.executed ? "Executed" : "Pending"}</p>
          </div>
        ))}
        {transactions.length === 0 ? <p>No records for this wallet route.</p> : null}
      </div>
    </div>
  );
};
