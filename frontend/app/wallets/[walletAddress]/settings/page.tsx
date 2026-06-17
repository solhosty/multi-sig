"use client";

import { use } from "react";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { OwnerManagement } from "@/components/owner-management";
import { PendingTransactionsPanel } from "@/components/pending-transactions-panel";
import { useWalletOwnership } from "@/lib/hooks/use-wallet-ownership";

type Props = {
  params: Promise<{
    walletAddress: `0x${string}`;
  }>;
};

export default function WalletSettingsPage({ params }: Props) {
  const { walletAddress } = use(params);
  const { accessState, hasAccess } = useWalletOwnership(walletAddress);

  if (!hasAccess) {
    return (
      <section className="space-y-4 py-6">
        <h1 className="text-2xl font-semibold">Owner Governance</h1>
        <div className="panel space-y-3 p-5 text-sm">
          {accessState === "invalid_wallet" ? (
            <p className="subtle-text">Invalid wallet address in route.</p>
          ) : null}
          {accessState === "no_connector" ? (
            <p className="subtle-text">No wallet connector detected.</p>
          ) : null}
          {accessState === "not_connected" ? (
            <>
              <p className="subtle-text">Connect a wallet owner account to access governance controls.</p>
              <ConnectWalletButton />
            </>
          ) : null}
          {accessState === "checking" ? (
            <p className="subtle-text">Checking on-chain owner permissions...</p>
          ) : null}
          {accessState === "not_owner" ? (
            <p className="subtle-text">Access denied. Connected wallet is not an owner of this multi-sig.</p>
          ) : null}
          {accessState === "read_failed" ? (
            <p className="subtle-text">Unable to verify owner status from chain. Try again shortly.</p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Owner Governance</h1>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Owner and threshold changes are proposed against wallet self-address and finalized through
        standard signing and execution.
      </p>
      <OwnerManagement walletAddress={walletAddress} />
      <PendingTransactionsPanel walletAddress={walletAddress} />
    </section>
  );
}
