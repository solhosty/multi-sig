"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs } from "viem";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ShareWalletLink } from "@/components/share-wallet-link";
import { factoryAbi } from "@/lib/contracts/factory-abi";
import { useFactory } from "@/lib/hooks/use-factory";

export const CreateWalletForm = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { createWallet, isCreating } = useFactory();

  const [ownersInput, setOwnersInput] = useState("");
  const [thresholdInput, setThresholdInput] = useState("2");
  const [hash, setHash] = useState<`0x${string}` | null>(null);

  const receiptQuery = useWaitForTransactionReceipt({ hash: hash ?? undefined });
  const notifiedWalletRef = useRef<`0x${string}` | null>(null);

  const owners = useMemo(() => {
    const raw = ownersInput
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean) as `0x${string}`[];

    if (address && !raw.includes(address)) {
      return [address, ...raw];
    }
    return raw;
  }, [address, ownersInput]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (owners.length === 0) {
      toast.error("Add at least one owner address");
      return;
    }

    const threshold = BigInt(thresholdInput);

    try {
      const txHash = await createWallet(owners, threshold);
      setHash(txHash);
      toast.success("Wallet deployment submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create wallet");
    }
  };

  const walletAddress = useMemo(() => {
    if (!receiptQuery.data) {
      return null;
    }

    const logs = parseEventLogs({
      abi: factoryAbi,
      eventName: "WalletCreated",
      logs: receiptQuery.data.logs
    });

    const created = logs[0]?.args.wallet;
    return created ?? null;
  }, [receiptQuery.data]);

  useEffect(() => {
    if (!walletAddress || notifiedWalletRef.current === walletAddress) {
      return;
    }

    notifiedWalletRef.current = walletAddress;
    toast.success("Wallet created");
  }, [walletAddress]);

  return (
    <div className="space-y-4">
      <form className="panel space-y-3 p-6" onSubmit={onSubmit}>
        <h2 className="text-xl font-semibold">Create New Multi-Sig</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Enter collaborators, threshold, and deploy through factory
        </p>
        <label className="block text-sm font-medium">Additional Owners (comma separated)</label>
        <textarea
          className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent p-3"
          onChange={(event) => setOwnersInput(event.target.value)}
          placeholder="0xabc...,0xdef..."
          rows={3}
          value={ownersInput}
        />
        <label className="block text-sm font-medium">Threshold</label>
        <input
          className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent p-3"
          min={1}
          onChange={(event) => setThresholdInput(event.target.value)}
          type="number"
          value={thresholdInput}
        />
        <button
          className="rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white"
          disabled={isCreating || receiptQuery.isLoading}
          type="submit"
        >
          {isCreating || receiptQuery.isLoading ? "Deploying..." : "Deploy Wallet"}
        </button>
      </form>

      {walletAddress ? (
        <div className="space-y-3">
          <div className="panel p-4 text-sm">
            Wallet ready: <span className="font-mono">{walletAddress}</span>
          </div>
          <ShareWalletLink walletAddress={walletAddress} />
          <button
            className="rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm"
            onClick={() => router.push(`/wallets/${walletAddress}/dashboard`)}
            type="button"
          >
            Open Wallet Dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
};
