"use client";

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";

import { multisigAbi } from "@/lib/contracts/multisig-abi";

export type WalletTransaction = {
  id: bigint;
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
  executed: boolean;
  signatureCount: bigint;
};

export const useWalletTransactions = (walletAddress: `0x${string}`) => {
  const countQuery = useReadContract({
    abi: multisigAbi,
    address: walletAddress,
    functionName: "getTransactionCount",
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 4_000
    }
  });

  const count = Number(countQuery.data ?? 0n);
  const txIds = useMemo(
    () => [...Array(count).keys()].map((index) => BigInt(index)).reverse(),
    [count]
  );

  const txQuery = useReadContracts({
    contracts: txIds.map((id) => ({
      abi: multisigAbi,
      address: walletAddress,
      functionName: "getTransaction",
      args: [id]
    })),
    query: {
      enabled: Boolean(walletAddress) && txIds.length > 0,
      refetchInterval: 4_000
    }
  });

  const transactions = useMemo<WalletTransaction[]>(() => {
    if (!txQuery.data) {
      return [];
    }

    return txQuery.data.flatMap((item, index) => {
      if (item.status !== "success") {
        return [];
      }

      const result = item.result;
      if (!Array.isArray(result) || result.length !== 5) {
        return [];
      }

      const [to, value, data, executed, signatureCount] = result as [
        `0x${string}`,
        bigint,
        `0x${string}`,
        boolean,
        bigint
      ];
      return [
        {
          id: txIds[index] ?? 0n,
          to,
          value,
          data,
          executed,
          signatureCount
        }
      ];
    });
  }, [txIds, txQuery.data]);

  return {
    count: countQuery.data ?? 0n,
    isLoading: countQuery.isLoading || txQuery.isLoading,
    transactions
  };
};
