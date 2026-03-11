"use client";

import { TransactionCard } from "@/components/transaction-card";
import { useMultisig } from "@/lib/hooks/use-multisig";
import { useWalletTransactions } from "@/lib/hooks/use-wallet-transactions";

type Props = {
  walletAddress: `0x${string}`;
};

export const PendingTransactionsPanel = ({ walletAddress }: Props) => {
  const { owners, threshold } = useMultisig(walletAddress);
  const { transactions, isLoading } = useWalletTransactions(walletAddress);

  if (isLoading) {
    return <div className="panel p-4 text-sm">Loading transactions...</div>;
  }

  const ownerList = (owners.data ?? []) as `0x${string}`[];
  const thresholdValue = threshold.data ?? 0n;

  if (transactions.length === 0) {
    return <div className="panel p-4 text-sm">No transactions for this wallet yet.</div>;
  }

  return (
    <section className="space-y-3">
      {transactions.map((tx) => (
        <TransactionCard
          key={tx.id.toString()}
          owners={ownerList}
          threshold={thresholdValue}
          tx={tx}
          walletAddress={walletAddress}
        />
      ))}
    </section>
  );
};
