"use client";

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
        {`${address.slice(0, 6)}...${address.slice(-4)} · Disconnect`}
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
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};
