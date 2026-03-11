"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, createConfig, WagmiProvider } from "wagmi";

import { appChain, contractConfig } from "@/lib/contracts/config";

const wagmiConfig = createConfig({
  chains: [appChain],
  transports: {
    [appChain.id]: http(contractConfig.rpcUrl)
  }
});

type Props = {
  children: ReactNode;
};

export const Web3Provider = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
