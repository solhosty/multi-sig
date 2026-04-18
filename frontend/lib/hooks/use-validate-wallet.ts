"use client";

import { useReadContract } from "wagmi";

import { contractConfig } from "@/lib/contracts/config";
import { factoryAbi } from "@/lib/contracts/factory-abi";

export const useIsValidWallet = (walletAddress: `0x${string}`) => {
  const validation = useReadContract({
    abi: factoryAbi,
    address: contractConfig.factoryAddress,
    functionName: "isWallet",
    args: walletAddress ? [walletAddress] : undefined,
    query: {
      enabled: Boolean(contractConfig.factoryAddress) && Boolean(walletAddress)
    }
  });

  return {
    isValid: Boolean(validation.data),
    isLoading: validation.isLoading || validation.isFetching
  };
};
