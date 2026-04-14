"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useBalance } from "wagmi";

import { QuickSendDemo } from "@/components/quick-send-demo";
import { WalletTransactionHistory } from "@/components/wallet-transaction-history";
import { useMultisig } from "@/lib/hooks/use-multisig";
import { useWalletTransactions } from "@/lib/hooks/use-wallet-transactions";

type Props = {
  params: {
    walletAddress: `0x${string}`;
  };
};

const formatBalance = (value: bigint): string => {
  const asEth = Number.parseFloat(formatEther(value));
  return `${asEth.toFixed(4)} ETH`;
};

export default function WalletDashboardPage({ params }: Props) {
  const walletAddress = params.walletAddress;
  const { owners, threshold } = useMultisig(walletAddress);
  const { transactions } = useWalletTransactions(walletAddress);
  const { data: balance } = useBalance({ address: walletAddress });

  const ownerList = (owners.data ?? []) as `0x${string}`[];
  const pendingCount = transactions.filter((item) => !item.executed).length;

  return (
    <section className="space-y-5 py-6">
      <div className="panel space-y-4 p-6 md:p-8">
        <p className="copy-pill inline-flex">Wallet Summary</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold md:text-3xl">Wallet Dashboard</h1>
          <p className="break-all font-mono text-xs subtle-text">{walletAddress}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="surface-muted p-3">
            <p className="text-xs subtle-text">Balance</p>
            <p className="mt-1 text-lg font-semibold">{formatBalance(balance?.value ?? 0n)}</p>
          </div>
          <div className="surface-muted p-3">
            <p className="text-xs subtle-text">Owners</p>
            <p className="mt-1 text-lg font-semibold">{ownerList.length}</p>
          </div>
          <div className="surface-muted p-3">
            <p className="text-xs subtle-text">Threshold</p>
            <p className="mt-1 text-lg font-semibold">{(threshold.data ?? 0n).toString()}</p>
          </div>
          <div className="surface-muted p-3">
            <p className="text-xs subtle-text">Status</p>
            <p className="mt-1 text-sm font-semibold">
              {pendingCount > 0 ? `${pendingCount} pending` : "All executed"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {ownerList.slice(0, 4).map((owner) => (
            <span className="copy-pill" key={owner}>
              {owner.slice(0, 6)}...{owner.slice(-4)}
            </span>
          ))}
          {ownerList.length > 4 ? <span className="copy-pill">+{ownerList.length - 4} more</span> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link className="btn-primary px-5 py-2.5 text-sm" href={`/wallets/${walletAddress}/send`}>
            Send / Sign / Execute
          </Link>
          <Link
            className="btn-secondary px-4 py-2 text-sm"
            href={`/wallets/${walletAddress}/transactions`}
          >
            Open Transactions
          </Link>
          <Link className="btn-secondary px-4 py-2 text-sm" href={`/wallets/${walletAddress}/settings`}>
            Owner Settings
          </Link>
        </div>
      </div>

      <QuickSendDemo walletAddress={walletAddress} />
      <WalletTransactionHistory walletAddress={walletAddress} />
    </section>
  );
}
