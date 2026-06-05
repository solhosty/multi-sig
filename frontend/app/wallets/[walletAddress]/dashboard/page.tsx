"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Activity, ShieldCheck, Users, Wallet } from "lucide-react";
import { formatEther } from "viem";
import { useBalance } from "wagmi";

import { Card, CardContent } from "@/components/ui/card";
import { QuickSendDemo } from "@/components/quick-send-demo";
import { WalletTransactionHistory } from "@/components/wallet-transaction-history";
import { useMultisig } from "@/lib/hooks/use-multisig";
import { useWalletTransactions } from "@/lib/hooks/use-wallet-transactions";

type Props = {
  params: {
    walletAddress: `0x${string}`;
  };
};

const formatBalance = (value: bigint): string => {
  const asEth = Number.parseFloat(formatEther(value));
  return `${asEth.toFixed(4)} ETH`;
};

export default function WalletDashboardPage({ params }: Props) {
  const walletAddress = params.walletAddress;
  const { owners, threshold } = useMultisig(walletAddress);
  const { transactions } = useWalletTransactions(walletAddress);
  const { data: balance } = useBalance({ address: walletAddress });

  const ownerList = (owners.data ?? []) as `0x${string}`[];
  const pendingCount = transactions.filter((item) => !item.executed).length;
  const stats = [
    {
      icon: Wallet,
      label: "Balance",
      value: formatBalance(balance?.value ?? 0n),
      meta: "Live wallet funds"
    },
    {
      icon: Users,
      label: "Owners",
      value: ownerList.length.toString(),
      meta: "Authorized signers"
    },
    {
      icon: ShieldCheck,
      label: "Threshold",
      value: (threshold.data ?? 0n).toString(),
      meta: "Signatures required"
    },
    {
      icon: Activity,
      label: "Status",
      value: pendingCount > 0 ? `${pendingCount} pending` : "All executed",
      meta: "Execution readiness"
    }
  ] as const;

  const statContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 }
    }
  } as const;

  const statItem = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  } as const;

  return (
    <section className="space-y-5 py-6">
      <div className="panel space-y-4 p-6 md:p-8">
        <p className="copy-pill inline-flex">Wallet Summary</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold md:text-3xl">Wallet Dashboard</h1>
          <p className="break-all font-mono text-xs subtle-text">{walletAddress}</p>
        </div>

        <motion.div
          animate="visible"
          className="grid gap-3 md:grid-cols-4"
          initial="hidden"
          variants={statContainer}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={statItem}>
                <Card className="border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))]/95 via-[hsl(var(--card))]/88 to-[hsl(var(--muted))]/66 shadow-soft-lg transition hover:-translate-y-1 hover:shadow-soft-xl">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-[0.08em] subtle-text">
                        {stat.label}
                      </p>
                      <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5">
                        <Icon className="h-4 w-4 text-[hsl(var(--accent))]" />
                      </span>
                    </div>
                    <p className="text-2xl font-semibold leading-none tracking-tight">{stat.value}</p>
                    <p className="text-xs subtle-text">{stat.meta}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="flex flex-wrap gap-2">
          {ownerList.slice(0, 4).map((owner) => (
            <span className="copy-pill" key={owner}>
              {owner.slice(0, 6)}...{owner.slice(-4)}
            </span>
          ))}
          {ownerList.length > 4 ? <span className="copy-pill">+{ownerList.length - 4} more</span> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link className="btn-primary px-4 py-2 text-sm" href={`/wallets/${walletAddress}/send`}>
            Send / Sign / Execute
          </Link>
          <Link
            className="btn-secondary px-4 py-2 text-sm"
            href={`/wallets/${walletAddress}/transactions`}
          >
            Open Transactions
          </Link>
          <Link className="btn-secondary px-4 py-2 text-sm" href={`/wallets/${walletAddress}/settings`}>
            Owner Settings
          </Link>
        </div>
      </div>

      <QuickSendDemo walletAddress={walletAddress} />
      <WalletTransactionHistory walletAddress={walletAddress} />
    </section>
  );
}
