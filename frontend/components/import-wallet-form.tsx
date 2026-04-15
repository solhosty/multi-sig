"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { toast } from "sonner";

export const ImportWalletForm = () => {
  const router = useRouter();
  const [input, setInput] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = input.trim();

    if (!isAddress(normalized)) {
      toast.error("Invalid wallet address");
      return;
    }

    router.push(`/wallets/${normalized}/dashboard`);
  };

  return (
    <form className="panel space-y-3 p-6" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold">Import Existing Wallet</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Paste a wallet address or shared invite payload
      </p>
      <input
        className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent p-3"
        onChange={(event) => setInput(event.target.value)}
        placeholder="0x..."
        value={input}
      />
      <button className="btn-primary px-4 py-2 text-sm" type="submit">
        Open Wallet
      </button>
    </form>
  );
};
