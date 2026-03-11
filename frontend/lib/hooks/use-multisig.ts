"use client";

import { useReadContract } from "wagmi";

import { multisigAbi } from "@/lib/contracts/multisig-abi";

export const useMultisig = (walletAddress: `0x${string}`) => {
  const owners = useReadContract({
    abi: multisigAbi,
    address: walletAddress,
    functionName: "getOwners",
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 4_000
    }
  });

  const threshold = useReadContract({
    abi: multisigAbi,
    address: walletAddress,
    functionName: "threshold",
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 4_000
    }
  });

  const transactionCount = useReadContract({
    abi: multisigAbi,
    address: walletAddress,
    functionName: "getTransactionCount",
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 4_000
    }
  });

  return {
    owners,
    threshold,
    transactionCount
  };
};
