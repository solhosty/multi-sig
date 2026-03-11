import Link from "next/link";

import { QuickSendDemo } from "@/components/quick-send-demo";
import { WalletTransactionHistory } from "@/components/wallet-transaction-history";

type Props = {
  params: {
    walletAddress: `0x${string}`;
  };
};

export default function WalletDashboardPage({ params }: Props) {
  const walletAddress = params.walletAddress;

  return (
    <section className="space-y-4 py-6">
      <div className="panel p-5">
        <h1 className="text-2xl font-semibold">Wallet Dashboard</h1>
        <p className="mt-1 font-mono text-xs">{walletAddress}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-sm"
            href={`/wallets/${walletAddress}/send`}
          >
            Send
          </Link>
          <Link
            className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-sm"
            href={`/wallets/${walletAddress}/transactions`}
          >
            Transactions
          </Link>
          <Link
            className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-sm"
            href={`/wallets/${walletAddress}/settings`}
          >
            Settings
          </Link>
        </div>
      </div>
      <QuickSendDemo walletAddress={walletAddress} />
      <WalletTransactionHistory walletAddress={walletAddress} />
    </section>
  );
}
