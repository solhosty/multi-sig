import Link from "next/link";

import { PendingTransactionsPanel } from "@/components/pending-transactions-panel";

type Props = {
  params: {
    walletAddress: `0x${string}`;
  };
};

export default function WalletTransactionsPage({ params }: Props) {
  const walletAddress = params.walletAddress;

  return (
    <section className="space-y-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wallet Transactions</h1>
        <Link
          className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-sm"
          href={`/wallets/${walletAddress}/transactions/new`}
        >
          New Proposal
        </Link>
      </div>
      <PendingTransactionsPanel walletAddress={walletAddress} />
    </section>
  );
}
