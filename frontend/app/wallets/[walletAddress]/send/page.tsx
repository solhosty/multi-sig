"use client";

import { use } from "react";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { PendingTransactionsPanel } from "@/components/pending-transactions-panel";
import { SendErc20Form } from "@/components/send-erc20-form";
import { SendEthForm } from "@/components/send-eth-form";
import { useWalletOwnership } from "@/lib/hooks/use-wallet-ownership";

type Props = {
  params: Promise<{
    walletAddress: `0x${string}`;
  }>;
};

export default function WalletSendPage({ params }: Props) {
  const { walletAddress } = use(params);
  const { accessState, hasAccess } = useWalletOwnership(walletAddress);

  if (!hasAccess) {
    return (
      <section className="space-y-4 py-6">
        <h1 className="text-2xl font-semibold">Send - Sign - Execute</h1>
        <div className="panel space-y-3 p-5 text-sm">
          {accessState === "invalid_wallet" ? (
            <p className="subtle-text">Invalid wallet address in route.</p>
          ) : null}
          {accessState === "no_connector" ? (
            <p className="subtle-text">No wallet connector detected.</p>
          ) : null}
          {accessState === "not_connected" ? (
            <>
              <p className="subtle-text">Connect a wallet owner account to access send controls.</p>
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
      <h1 className="text-2xl font-semibold">Send - Sign - Execute</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <SendEthForm walletAddress={walletAddress} />
        <SendErc20Form walletAddress={walletAddress} />
      </div>
      <PendingTransactionsPanel walletAddress={walletAddress} />
    </section>
  );
}
