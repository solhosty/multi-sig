"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi";

import { factoryAbi } from "@/lib/contracts/factory-abi";
import { contractConfig } from "@/lib/contracts/config";
import { multisigAbi } from "@/lib/contracts/multisig-abi";

const DISCOVERY_WALLET_LIMIT = 50;
const FACTORY_REFETCH_INTERVAL_MS = 30_000;

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
      refetchInterval: FACTORY_REFETCH_INTERVAL_MS
    }
  });

  const ownerWallets = useReadContract({
    abi: factoryAbi,
    address: contractConfig.factoryAddress,
    functionName: "getWalletsByOwner",
    args: address ? [address] : undefined,
    query: {
      enabled: canRead && Boolean(address),
      refetchInterval: FACTORY_REFETCH_INTERVAL_MS
    }
  });

  const candidateWallets = useMemo(() => {
    const normalized = new Map<string, `0x${string}`>();
    const ownerList = ((ownerWallets.data ?? []) as `0x${string}`[]).slice(0, DISCOVERY_WALLET_LIMIT);
    const creatorList = ((creatorWallets.data ?? []) as `0x${string}`[]).slice(
      0,
      DISCOVERY_WALLET_LIMIT
    );

    for (const wallet of [...ownerList, ...creatorList]) {
      normalized.set(wallet.toLowerCase(), wallet);

      if (normalized.size >= DISCOVERY_WALLET_LIMIT) {
        break;
      }
    }

    return Array.from(normalized.values());
  }, [creatorWallets.data, ownerWallets.data]);

  const ownershipValidation = useReadContracts({
    contracts: address
      ? candidateWallets.map((walletAddress) => ({
          abi: multisigAbi,
          address: walletAddress,
          functionName: "isOwner" as const,
          args: [address]
        }))
      : [],
    query: {
      enabled: canRead && Boolean(address) && candidateWallets.length > 0,
      refetchInterval: FACTORY_REFETCH_INTERVAL_MS
    }
  });

  const ownedWallets = useMemo(() => {
    if (!ownershipValidation.data) {
      return [];
    }

    return ownershipValidation.data.flatMap((validation, index) => {
      if (
        validation.status !== "success" ||
        typeof validation.result !== "boolean" ||
        !validation.result
      ) {
        return [];
      }

      const walletAddress = candidateWallets[index];
      return walletAddress ? [walletAddress] : [];
    });
  }, [candidateWallets, ownershipValidation.data]);

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
    isLoadingWallets:
      creatorWallets.isLoading || ownerWallets.isLoading || ownershipValidation.isLoading,
    isCreating: isPending
  };
};
