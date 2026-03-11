import { OwnerManagement } from "@/components/owner-management";
import { PendingTransactionsPanel } from "@/components/pending-transactions-panel";

type Props = {
  params: {
    walletAddress: `0x${string}`;
  };
};

export default function WalletSettingsPage({ params }: Props) {
  const walletAddress = params.walletAddress;

  return (
    <section className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Owner Governance</h1>
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Owner and threshold changes are proposed against wallet self-address and finalized through
        standard signing and execution.
      </p>
      <OwnerManagement walletAddress={walletAddress} />
      <PendingTransactionsPanel walletAddress={walletAddress} />
    </section>
  );
}
