"use client";

import { useState, type FormEvent } from "react";
import { isAddress } from "viem";
import { toast } from "sonner";

import { useMultisigActions } from "@/lib/hooks/use-multisig-actions";

type Props = {
  walletAddress: `0x${string}`;
};

export const OwnerManagement = ({ walletAddress }: Props) => {
  const { proposeAddOwner, proposeRemoveOwner, proposeThresholdUpdate, isPending } =
    useMultisigActions(walletAddress);
  const [newOwner, setNewOwner] = useState("");
  const [oldOwner, setOldOwner] = useState("");
  const [newThreshold, setNewThreshold] = useState("2");

  const onAddOwner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAddress(newOwner)) {
      toast.error("Invalid owner address");
      return;
    }
    try {
      await proposeAddOwner(newOwner);
      toast.success("Add owner proposal submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Add owner proposal failed");
    }
  };

  const onRemoveOwner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAddress(oldOwner)) {
      toast.error("Invalid owner address");
      return;
    }
    try {
      await proposeRemoveOwner(oldOwner);
      toast.success("Remove owner proposal submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Remove owner proposal failed");
    }
  };

  const onThreshold = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await proposeThresholdUpdate(BigInt(newThreshold));
      toast.success("Threshold change proposal submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Threshold proposal failed");
    }
  };

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <form className="panel space-y-2 p-4" onSubmit={onAddOwner}>
        <h3 className="text-sm font-semibold">Add Owner</h3>
        <input
          className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent p-2 text-sm"
          onChange={(event) => setNewOwner(event.target.value)}
          placeholder="0x..."
          value={newOwner}
        />
        <button
          className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs"
          disabled={isPending}
          type="submit"
        >
          Propose Add
        </button>
      </form>

      <form className="panel space-y-2 p-4" onSubmit={onRemoveOwner}>
        <h3 className="text-sm font-semibold">Remove Owner</h3>
        <input
          className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent p-2 text-sm"
          onChange={(event) => setOldOwner(event.target.value)}
          placeholder="0x..."
          value={oldOwner}
        />
        <button
          className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs"
          disabled={isPending}
          type="submit"
        >
          Propose Remove
        </button>
      </form>

      <form className="panel space-y-2 p-4" onSubmit={onThreshold}>
        <h3 className="text-sm font-semibold">Change Threshold</h3>
        <input
          className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent p-2 text-sm"
          min={1}
          onChange={(event) => setNewThreshold(event.target.value)}
          type="number"
          value={newThreshold}
        />
        <button
          className="rounded-md border border-[hsl(var(--border))] px-3 py-2 text-xs"
          disabled={isPending}
          type="submit"
        >
          Propose Threshold
        </button>
      </form>
    </div>
  );
};
