"use client";

import { useMemo } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";

import { factoryAbi } from "@/lib/contracts/factory-abi";
import { appChain, contractConfig } from "@/lib/contracts/config";

export const useFactory = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useWriteContract();
  const isExpectedChain = chainId === appChain.id;

  const canRead = useMemo(
    () => Boolean(contractConfig.factoryAddress) && isExpectedChain,
    [isExpectedChain]
  );

  const creatorWallets = useReadContract({
    abi: factoryAbi,
    address: contractConfig.factoryAddress,
    chainId: appChain.id,
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
    chainId: appChain.id,
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

    if (!isExpectedChain) {
      throw new Error(`Wrong network. Switch to ${appChain.name} before creating a wallet.`);
    }

    return writeContractAsync({
      abi: factoryAbi,
      address: contractConfig.factoryAddress,
      chainId: appChain.id,
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
    isCreating: isPending,
    isWrongNetwork: !isExpectedChain
  };
};
