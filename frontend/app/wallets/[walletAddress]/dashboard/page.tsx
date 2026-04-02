"use client";

import Link from "next/link";
import { use } from "react";
import { formatEther } from "viem";
import { useBalance } from "wagmi";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { QuickSendDemo } from "@/components/quick-send-demo";
import { WalletTransactionHistory } from "@/components/wallet-transaction-history";
import { useMultisig } from "@/lib/hooks/use-multisig";
import { useWalletOwnership } from "@/lib/hooks/use-wallet-ownership";
import { useWalletTransactions } from "@/lib/hooks/use-wallet-transactions";

type Props = {
  params: Promise<{
    walletAddress: `0x${string}`;
  }>;
};

const formatBalance = (value: bigint): string => {
  const asEth = Number.parseFloat(formatEther(value));
  return `${asEth.toFixed(4)} ETH`;
};

export default function WalletDashboardPage({ params }: Props) {
  const { walletAddress } = use(params);
  const { accessState, hasAccess, validWalletAddress } = useWalletOwnership(walletAddress);

  if (!validWalletAddress) {
    return (
      <section className="space-y-5 py-6">
        <div className="panel p-6 md:p-8">
          <h1 className="text-2xl font-semibold md:text-3xl">Wallet Dashboard</h1>
          <p className="mt-2 text-sm subtle-text">Invalid wallet address in route.</p>
        </div>
      </section>
    );
  }

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
          {hasAccess ? (
            <Link className="btn-primary px-4 py-2 text-sm" href={`/wallets/${walletAddress}/send`}>
              Send / Sign / Execute
            </Link>
          ) : null}
          <Link
            className="btn-secondary px-4 py-2 text-sm"
            href={`/wallets/${walletAddress}/transactions`}
          >
            Open Transactions
          </Link>
          {hasAccess ? (
            <Link className="btn-secondary px-4 py-2 text-sm" href={`/wallets/${walletAddress}/settings`}>
              Owner Settings
            </Link>
          ) : null}
        </div>

        {!hasAccess ? (
          <div className="panel space-y-3 p-4 text-sm">
            {accessState === "no_connector" ? (
              <p className="subtle-text">No wallet connector detected.</p>
            ) : null}
            {accessState === "not_connected" ? (
              <>
                <p className="subtle-text">Connect a wallet owner account for management access.</p>
                <ConnectWalletButton />
              </>
            ) : null}
            {accessState === "checking" ? (
              <p className="subtle-text">Checking on-chain owner permissions...</p>
            ) : null}
            {accessState === "not_owner" ? (
              <p className="subtle-text">
                Connected wallet is not an owner of this multi-sig. Dashboard is read-only.
              </p>
            ) : null}
            {accessState === "read_failed" ? (
              <p className="subtle-text">Unable to verify owner status from chain. Try again shortly.</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {hasAccess ? <QuickSendDemo walletAddress={walletAddress} /> : null}
      <WalletTransactionHistory walletAddress={walletAddress} />
    </section>
  );
}
