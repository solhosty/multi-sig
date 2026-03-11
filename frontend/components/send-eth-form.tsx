"use client";

import { useState, type FormEvent } from "react";
import { isAddress } from "viem";
import { toast } from "sonner";

import { useMultisigActions } from "@/lib/hooks/use-multisig-actions";
import { parseEthAmount } from "@/lib/encoding/transaction-data";

type Props = {
  walletAddress: `0x${string}`;
};

export const SendEthForm = ({ walletAddress }: Props) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.01");

  const { submit, isPending } = useMultisigActions(walletAddress);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAddress(recipient)) {
      toast.error("Enter a valid recipient address");
      return;
    }

    try {
      await submit(recipient, parseEthAmount(amount), "0x");
      toast.success("ETH transfer proposal submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit ETH proposal");
    }
  };

  return (
    <form className="panel space-y-3 p-4" onSubmit={onSubmit}>
      <h3 className="text-sm font-semibold uppercase tracking-wide">Propose ETH Send</h3>
      <input
        className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent p-2 text-sm"
        onChange={(event) => setRecipient(event.target.value)}
        placeholder="Recipient address"
        value={recipient}
      />
      <input
        className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent p-2 text-sm"
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Amount in ETH"
        value={amount}
      />
      <button
        className="rounded-md bg-[hsl(var(--accent))] px-3 py-2 text-sm font-semibold text-white"
        disabled={isPending}
        type="submit"
      >
        Submit ETH Proposal
      </button>
    </form>
  );
};
