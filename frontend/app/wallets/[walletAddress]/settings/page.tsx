import { OwnerManagement } from "@/components/owner-management";
import { PendingTransactionsPanel } from "@/components/pending-transactions-panel";
import {
  getValidWalletAddressFromParams,
  type WalletAddressRouteParams,
} from "@/lib/utils/wallet-address";

type Props = {
  params: Promise<WalletAddressRouteParams>;
};

export default async function WalletSettingsPage({ params }: Props) {
  const walletAddress = getValidWalletAddressFromParams(await params);

  if (!walletAddress) {
    return (
      <section className="space-y-4 py-6">
        <h1 className="text-2xl font-semibold">Invalid wallet address</h1>
      </section>
    );
  }

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
