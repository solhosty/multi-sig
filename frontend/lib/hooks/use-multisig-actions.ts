"use client";

import { useWriteContract } from "wagmi";

import { multisigAbi } from "@/lib/contracts/multisig-abi";
import {
  encodeAddOwner,
  encodeRemoveOwner,
  encodeUpdateThreshold
} from "@/lib/encoding/transaction-data";

export const useMultisigActions = (walletAddress: `0x${string}`) => {
  const { writeContractAsync, isPending } = useWriteContract();

  const submit = (to: `0x${string}`, value: bigint, data: `0x${string}`) =>
    writeContractAsync({
      abi: multisigAbi,
      address: walletAddress,
      functionName: "submitTransaction",
      args: [to, value, data]
    });

  const sign = (txId: bigint) =>
    writeContractAsync({
      abi: multisigAbi,
      address: walletAddress,
      functionName: "signTransaction",
      args: [txId]
    });

  const execute = (txId: bigint) =>
    writeContractAsync({
      abi: multisigAbi,
      address: walletAddress,
      functionName: "executeTransaction",
      args: [txId]
    });

  const proposeAddOwner = (newOwner: `0x${string}`) => submit(walletAddress, 0n, encodeAddOwner(newOwner));
  const proposeRemoveOwner = (oldOwner: `0x${string}`) =>
    submit(walletAddress, 0n, encodeRemoveOwner(oldOwner));
  const proposeThresholdUpdate = (newThreshold: bigint) =>
    submit(walletAddress, 0n, encodeUpdateThreshold(newThreshold));

  return {
    submit,
    sign,
    execute,
    proposeAddOwner,
    proposeRemoveOwner,
    proposeThresholdUpdate,
    isPending
  };
};
