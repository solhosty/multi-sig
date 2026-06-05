"use client";

import { LogOut, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const ConnectWalletButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        className="btn-secondary px-4 py-2 text-sm"
        onClick={() => disconnect()}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
          <span className="subtle-text">·</span>
          <span className="inline-flex items-center gap-1">
            <LogOut className="h-3.5 w-3.5" />
            Disconnect
          </span>
        </span>
      </button>
    );
  }

  const connector = connectors.find((item) => item.type === "injected") ?? connectors[0];
  if (!connector) {
    return <span className="text-sm subtle-text">No wallet connector detected</span>;
  }

  return (
    <button
      className="btn-primary px-4 py-2 text-sm"
      disabled={isPending}
      onClick={() => connect({ connector })}
      type="button"
    >
      <span className="inline-flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        {isPending ? "Connecting..." : "Connect Wallet"}
      </span>
    </button>
  );
};
