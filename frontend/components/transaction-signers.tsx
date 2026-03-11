"use client";

import { useReadContracts } from "wagmi";

import { multisigAbi } from "@/lib/contracts/multisig-abi";

type Props = {
  walletAddress: `0x${string}`;
  owners: `0x${string}`[];
  txId: bigint;
};

export const TransactionSigners = ({ walletAddress, owners, txId }: Props) => {
  const signatures = useReadContracts({
    contracts: owners.map((owner) => ({
      abi: multisigAbi,
      address: walletAddress,
      functionName: "hasSigned",
      args: [txId, owner]
    })),
    query: {
      enabled: owners.length > 0,
      refetchInterval: 4_000
    }
  });

  return (
    <div className="space-y-2 text-xs">
      {owners.map((owner, index) => {
        const isSigned = signatures.data?.[index]?.status === "success" && signatures.data[index].result;
        return (
          <div className="flex items-center justify-between" key={owner}>
            <span className="font-mono">{owner}</span>
            <span className={isSigned ? "text-emerald-600" : "text-slate-500"}>
              {isSigned ? "signed" : "waiting"}
            </span>
          </div>
        );
      })}
    </div>
  );
};
