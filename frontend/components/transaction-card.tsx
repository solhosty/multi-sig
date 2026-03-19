"use client";

import { toast } from "sonner";
import { useReadContract } from "wagmi";

import type { WalletTransaction } from "@/lib/hooks/use-wallet-transactions";
import { useMultisigActions } from "@/lib/hooks/use-multisig-actions";
import { txExplorerUrl } from "@/lib/utils/explorer";
import { multisigAbi } from "@/lib/contracts/multisig-abi";

import { TransactionSigners } from "@/components/transaction-signers";

type Props = {
  tx: WalletTransaction;
  walletAddress: `0x${string}`;
  owners: `0x${string}`[];
  threshold: bigint;
};

export const TransactionCard = ({ tx, walletAddress, owners, threshold }: Props) => {
  const { execute, sign, isPending } = useMultisigActions(walletAddress);
  const { data: validSigCount } = useReadContract({
    abi: multisigAbi,
    address: walletAddress,
    functionName: "getValidSignatureCount",
    args: [tx.id],
    query: { enabled: !tx.executed, refetchInterval: 4_000 }
  });
  const sigCount = validSigCount ?? tx.signatureCount;
  const canExecute = sigCount >= threshold && !tx.executed;
  const statusClass = tx.executed
    ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"
    : "bg-[hsl(var(--warning))]/14 text-[hsl(var(--warning))]";

  return (
    <article className="panel space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Transaction #{tx.id.toString()}</h4>
        <span className={`rounded-full px-2 py-1 text-xs ${statusClass}`}>
          {tx.executed ? "executed" : "pending"}
        </span>
      </div>

      <div className="surface-muted space-y-1 p-3 text-xs">
        <p className="break-all">
          To: <span className="font-mono">{tx.to}</span>
        </p>
        <p>Value: {tx.value.toString()} wei</p>
        <p>
          Signatures: {sigCount.toString()} / {threshold.toString()}
        </p>
      </div>

      <TransactionSigners owners={owners} txId={tx.id} walletAddress={walletAddress} />

      <div className="flex flex-wrap gap-2">
        <button
          className="btn-secondary px-3 py-2 text-xs"
          disabled={isPending || tx.executed}
          onClick={async () => {
            try {
              const hash = await sign(tx.id);
              toast.success("Signature submitted", {
                action: {
                  label: "Explorer",
                  onClick: () => window.open(txExplorerUrl(hash), "_blank")
                }
              });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Signing failed");
            }
          }}
          type="button"
        >
          Sign
        </button>
        <button
          className="btn-primary px-3 py-2 text-xs disabled:opacity-60"
          disabled={isPending || !canExecute}
          onClick={async () => {
            try {
              const hash = await execute(tx.id);
              toast.success("Execution submitted", {
                action: {
                  label: "Explorer",
                  onClick: () => window.open(txExplorerUrl(hash), "_blank")
                }
              });
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Execution failed");
            }
          }}
          type="button"
        >
          Execute
        </button>
      </div>
    </article>
  );
};
