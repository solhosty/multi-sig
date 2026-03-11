import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6 py-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Create or Import Your Wallet</h1>
        <p className="max-w-2xl text-sm text-slate-700 dark:text-slate-300">
          Launch a new multi-sig through the factory or import an existing wallet to manage send,
          sign, and execute transactions on Sepolia.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link className="panel block p-6 transition hover:translate-y-[-2px]" href="/wallets/new">
          <h2 className="text-xl font-semibold">Create New Wallet</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Deploy a wallet via MultiSigFactory and invite collaborators
          </p>
        </Link>
        <Link
          className="panel block p-6 transition hover:translate-y-[-2px]"
          href="/wallets/import"
        >
          <h2 className="text-xl font-semibold">Import Existing Wallet</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Open by wallet address or shared invite payload
          </p>
        </Link>
      </div>
    </section>
  );
}
