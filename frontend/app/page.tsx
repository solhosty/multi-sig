"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useAccount } from "wagmi";

const features = [
  {
    title: "Factory-first deployment",
    description: "Launch independent multi-sig wallets with deterministic ownership metadata."
  },
  {
    title: "Send, sign, execute",
    description: "Coordinate ETH and ERC-20 proposals through one transparent approval pipeline."
  },
  {
    title: "Wallet-scoped collaboration",
    description: "Track signer progress and transaction status per wallet route with zero ambiguity."
  }
] as const;

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <section className="space-y-10 py-8 md:py-14">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="panel overflow-hidden p-7 md:p-10"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="grid gap-8 md:grid-cols-[1.2fr,0.8fr] md:items-center">
          <div className="space-y-5">
            <p className="copy-pill inline-flex">Sepolia Multi-Sig Control Center</p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Beautifully simple wallet governance for real on-chain teams
            </h1>
            <p className="max-w-2xl text-base subtle-text">
              Deploy from factory, invite signers, and execute treasury moves in a polished,
              collaborative flow built for daily operation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="btn-primary px-5 py-3 text-sm" href="/wallets">
                {isConnected ? "Open Your Wallets" : "Discover Wallets"}
              </Link>
              <Link className="btn-secondary px-5 py-3 text-sm" href="/wallets/new">
                Create New Wallet
              </Link>
              <Link className="btn-secondary px-5 py-3 text-sm" href="/wallets/import">
                Import by Address
              </Link>
            </div>
          </div>
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="surface-muted grid gap-3 p-5"
            initial={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <p className="text-xs uppercase tracking-[0.18em] subtle-text">Workflow</p>
            <p className="text-sm">Create or import wallet</p>
            <p className="text-sm">Propose transaction</p>
            <p className="text-sm">Collect owner signatures</p>
            <p className="text-sm">Execute and verify</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="panel p-5"
            initial={{ opacity: 0, y: 10 }}
            key={feature.title}
            transition={{ duration: 0.35, delay: 0.05 * index, ease: "easeOut" }}
            whileHover={{ y: -4 }}
          >
            <h2 className="text-base font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm subtle-text">{feature.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
