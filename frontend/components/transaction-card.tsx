"use client";

import { toast } from "sonner";

import type { WalletTransaction } from "@/lib/hooks/use-wallet-transactions";
import { useMultisigActions } from "@/lib/hooks/use-multisig-actions";
import { txExplorerUrl } from "@/lib/utils/explorer";

import { TransactionSigners } from "@/components/transaction-signers";

type Props = {
  tx: WalletTransaction;
  walletAddress: `0x${string}`;
  owners: `0x${string}`[];
  threshold: bigint;
};

export const TransactionCard = ({ tx, walletAddress, owners, threshold }: Props) => {
  const { execute, sign, isPending } = useMultisigActions(walletAddress);
  const canExecute = tx.signatureCount >= threshold && !tx.executed;

  return (
    <article className="panel space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Transaction #{tx.id.toString()}</h4>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            tx.executed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {tx.executed ? "executed" : "pending"}
        </span>
      </div>

      <div className="space-y-1 text-xs">
        <p>
          To: <span className="font-mono">{tx.to}</span>
        </p>
        <p>Value: {tx.value.toString()} wei</p>
        <p>Signatures: {tx.signatureCount.toString()} / {threshold.toString()}</p>
      </div>

      <TransactionSigners owners={owners} txId={tx.id} walletAddress={walletAddress} />

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md border border-[hsl(var(--border))] px-3 py-1 text-xs"
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
          className="rounded-md bg-[hsl(var(--accent))] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
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
