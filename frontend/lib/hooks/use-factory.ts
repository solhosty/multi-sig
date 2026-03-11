"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

import { factoryAbi } from "@/lib/contracts/factory-abi";
import { contractConfig } from "@/lib/contracts/config";

export const useFactory = () => {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const canRead = useMemo(() => Boolean(contractConfig.factoryAddress), []);

  const creatorWallets = useReadContract({
    abi: factoryAbi,
    address: contractConfig.factoryAddress,
    functionName: "getWalletsByCreator",
    args: address ? [address] : undefined,
    query: {
      enabled: canRead && Boolean(address),
      refetchInterval: 5_000
    }
  });

  const ownerWallets = useReadContract({
    abi: factoryAbi,
    address: contractConfig.factoryAddress,
    functionName: "getWalletsByOwner",
    args: address ? [address] : undefined,
    query: {
      enabled: canRead && Boolean(address),
      refetchInterval: 5_000
    }
  });

  const ownedWallets = useMemo(() => {
    const normalized = new Map<string, `0x${string}`>();
    const ownerList = (ownerWallets.data ?? []) as `0x${string}`[];
    const creatorList = (creatorWallets.data ?? []) as `0x${string}`[];

    for (const wallet of [...ownerList, ...creatorList]) {
      normalized.set(wallet.toLowerCase(), wallet);
    }

    return Array.from(normalized.values());
  }, [creatorWallets.data, ownerWallets.data]);

  const createWallet = async (owners: `0x${string}`[], threshold: bigint) => {
    if (!contractConfig.factoryAddress) {
      throw new Error("Factory address is not configured");
    }

    return writeContractAsync({
      abi: factoryAbi,
      address: contractConfig.factoryAddress,
      functionName: "createWallet",
      args: [owners, threshold]
    });
  };

  return {
    createWallet,
    creatorWallets,
    ownerWallets,
    ownedWallets,
    isLoadingWallets: creatorWallets.isLoading || ownerWallets.isLoading,
    isCreating: isPending
  };
};
