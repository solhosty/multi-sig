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
    <form className="panel space-y-3 p-4 md:p-5" onSubmit={onSubmit}>
      <h3 className="text-sm font-semibold uppercase tracking-wide">Propose ETH Send</h3>
      <input
        className="input-base"
        onChange={(event) => setRecipient(event.target.value)}
        placeholder="Recipient address"
        value={recipient}
      />
      <input
        className="input-base"
        onChange={(event) => setAmount(event.target.value)}
        placeholder="Amount in ETH"
        value={amount}
      />
      <button
        className="btn-primary px-3 py-2 text-sm"
        disabled={isPending}
        type="submit"
      >
        Submit ETH Proposal
      </button>
    </form>
  );
};
