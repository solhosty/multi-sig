"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export const ConnectWalletButton = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        className="rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
        onClick={() => disconnect()}
        type="button"
      >
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </button>
    );
  }

  const connector = connectors[0];
  if (!connector) {
    return <span className="text-sm">No wallet connector detected</span>;
  }

  return (
    <button
      className="rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
      disabled={isPending}
      onClick={() => connect({ connector })}
      type="button"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};
