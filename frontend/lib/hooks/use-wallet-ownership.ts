"use client";

import { isAddress, zeroAddress } from "viem";
import { useAccount, useConnect, useReadContract } from "wagmi";

import { multisigAbi } from "@/lib/contracts/multisig-abi";

type AccessState =
  | "authorized"
  | "invalid_wallet"
  | "no_connector"
  | "not_connected"
  | "checking"
  | "not_owner"
  | "read_failed";

export const useWalletOwnership = (walletAddress: string) => {
  const { address, isConnected } = useAccount();
  const { connectors } = useConnect();

  const validWalletAddress = isAddress(walletAddress);
  const hasConnector = connectors.length > 0;

  const ownerCheck = useReadContract({
    abi: multisigAbi,
    address: (validWalletAddress ? walletAddress : zeroAddress) as `0x${string}`,
    functionName: "isOwner",
    args: [address ?? zeroAddress],
    query: {
      enabled: validWalletAddress && Boolean(address),
      retry: false,
      refetchInterval: 4_000
    }
  });

  const isOwner = ownerCheck.data === true;
  const checking = ownerCheck.isLoading || ownerCheck.isFetching;

  let accessState: AccessState;
  if (!validWalletAddress) {
    accessState = "invalid_wallet";
  } else if (!hasConnector) {
    accessState = "no_connector";
  } else if (!isConnected || !address) {
    accessState = "not_connected";
  } else if (checking) {
    accessState = "checking";
  } else if (ownerCheck.isError) {
    accessState = "read_failed";
  } else if (!isOwner) {
    accessState = "not_owner";
  } else {
    accessState = "authorized";
  }

  return {
    accessState,
    hasAccess: accessState === "authorized",
    isOwner,
    validWalletAddress
  };
};
