"use client";

import { useState, type FormEvent } from "react";
import { isAddress, parseUnits } from "viem";
import { toast } from "sonner";

import { encodeErc20Transfer } from "@/lib/encoding/transaction-data";
import { useMultisigActions } from "@/lib/hooks/use-multisig-actions";

type Props = {
  walletAddress: `0x${string}`;
};

export const SendErc20Form = ({ walletAddress }: Props) => {
  const { submit, isPending } = useMultisigActions(walletAddress);
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1");
  const [decimals, setDecimals] = useState("18");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAddress(tokenAddress) || !isAddress(recipient)) {
      toast.error("Enter valid token and recipient addresses");
      return;
    }

    try {
      const transferData = encodeErc20Transfer(
        recipient,
        parseUnits(amount, Number.parseInt(decimals, 10))
      );

      await submit(tokenAddress, 0n, transferData);
      toast.success("ERC-20 transfer proposal submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit ERC-20 proposal");
    }
  };

  return (
    <form className="panel space-y-3 p-4 md:p-5" onSubmit={onSubmit}>
      <h3 className="text-sm font-semibold uppercase tracking-wide">Propose ERC-20 Send</h3>
      <input
        className="input-base"
        onChange={(event) => setTokenAddress(event.target.value)}
        placeholder="Token contract"
        value={tokenAddress}
      />
      <input
        className="input-base"
        onChange={(event) => setRecipient(event.target.value)}
        placeholder="Recipient address"
        value={recipient}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className="input-base"
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
          value={amount}
        />
        <input
          className="input-base"
          onChange={(event) => setDecimals(event.target.value)}
          placeholder="Decimals"
          value={decimals}
        />
      </div>
      <button
        className="btn-primary px-3 py-2 text-sm"
        disabled={isPending}
        type="submit"
      >
        Submit ERC-20 Proposal
      </button>
    </form>
  );
};
