import { encodeFunctionData, parseEther } from "viem";

import { erc20Abi } from "@/lib/contracts/erc20-abi";
import { multisigAbi } from "@/lib/contracts/multisig-abi";

export const encodeErc20Transfer = (recipient: `0x${string}`, amount: bigint): `0x${string}` => {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [recipient, amount]
  });
};

export const encodeAddOwner = (newOwner: `0x${string}`): `0x${string}` => {
  return encodeFunctionData({
    abi: multisigAbi,
    functionName: "addOwner",
    args: [newOwner]
  });
};

export const encodeRemoveOwner = (oldOwner: `0x${string}`): `0x${string}` => {
  return encodeFunctionData({
    abi: multisigAbi,
    functionName: "removeOwner",
    args: [oldOwner]
  });
};

export const encodeUpdateThreshold = (newThreshold: bigint): `0x${string}` => {
  return encodeFunctionData({
    abi: multisigAbi,
    functionName: "updateThreshold",
    args: [newThreshold]
  });
};

export const parseEthAmount = (value: string): bigint => parseEther(value || "0");
