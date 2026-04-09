import Link from "next/link";

import { PendingTransactionsPanel } from "@/components/pending-transactions-panel";
import {
  getValidWalletAddressFromParams,
  type WalletAddressRouteParams,
} from "@/lib/utils/wallet-address";

type Props = {
  params: Promise<WalletAddressRouteParams>;
};

export default async function WalletTransactionsPage({ params }: Props) {
  const walletAddress = getValidWalletAddressFromParams(await params);

  if (!walletAddress) {
    return (
      <section className="space-y-4 py-6">
        <h1 className="text-2xl font-semibold">Invalid wallet address</h1>
      </section>
    );
  }

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
