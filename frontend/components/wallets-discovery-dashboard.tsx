"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import { LoadingSkeleton } from "@/components/loading-skeleton";
import { WalletCard } from "@/components/wallet-card";
import { useFactory } from "@/lib/hooks/use-factory";

const trimAddress = (value: `0x${string}`): string => `${value.slice(0, 6)}...${value.slice(-4)}`;

export const WalletsDiscoveryDashboard = () => {
  const { address, isConnected } = useAccount();
  const { ownedWallets, isLoadingWallets } = useFactory();

  const copyAddress = async () => {
    if (!address) {
      return;
    }
    await navigator.clipboard.writeText(address);
    toast.success("Connected address copied");
  };

  if (!isConnected || !address) {
    return (
      <section className="panel space-y-4 p-6 md:p-8">
        <h1 className="text-2xl font-semibold">Wallet Discovery</h1>
        <p className="text-sm subtle-text">
          Connect your wallet to load every multi-sig you own and jump straight into collaborative
          signing.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link className="btn-secondary px-4 py-2 text-sm" href="/wallets/new">
            Create New Wallet
          </Link>
          <Link className="btn-secondary px-4 py-2 text-sm" href="/wallets/import">
            Import Wallet
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="panel space-y-4 p-6 md:p-8">
        <p className="copy-pill inline-flex">Connected Account</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">Your Wallets</h1>
          <span className="rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs">
            {ownedWallets.length} discovered
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-sm subtle-text">{trimAddress(address)}</p>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={copyAddress} type="button">
            Copy
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn-primary px-5 py-2.5 text-sm" href="/wallets/new">
            Create New Wallet
          </Link>
          <Link className="btn-secondary px-4 py-2 text-sm" href="/wallets/import">
            Import by Address
          </Link>
        </div>
      </div>

      {isLoadingWallets ? (
        <div className="grid gap-4 md:grid-cols-2">
          <LoadingSkeleton className="h-48 w-full" />
          <LoadingSkeleton className="h-48 w-full" />
        </div>
      ) : ownedWallets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {ownedWallets.map((wallet) => (
            <WalletCard key={wallet} walletAddress={wallet} />
          ))}
        </div>
      ) : (
        <div className="panel p-6">
          <p className="text-sm subtle-text">
            No owned wallets found yet. Create one now or import a known wallet address.
          </p>
        </div>
      )}
    </section>
  );
};
