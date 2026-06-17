"use client";

import { isAddress } from "viem";
import { useReadContract } from "wagmi";

import { contractConfig } from "@/lib/contracts/config";
import { factoryAbi } from "@/lib/contracts/factory-abi";

export const useValidatedWallet = (walletAddress: string) => {
  const canValidate = Boolean(contractConfig.factoryAddress);
  const hasAddressFormat = isAddress(walletAddress);

  const walletsQuery = useReadContract({
    abi: factoryAbi,
    address: contractConfig.factoryAddress,
    functionName: "getAllWallets",
    query: {
      enabled: canValidate && hasAddressFormat,
      refetchInterval: 5_000
    }
  });

  const registeredWallets = (walletsQuery.data ?? []) as `0x${string}`[];
  const normalizedInput = walletAddress.toLowerCase();

  const isRegistered = registeredWallets.some(
    (registeredWallet) => registeredWallet.toLowerCase() === normalizedInput
  );

  return {
    isValidating: walletsQuery.isLoading,
    isValidWallet: canValidate && hasAddressFormat && isRegistered
  };
};
