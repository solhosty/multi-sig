import { PendingTransactionsPanel } from "@/components/pending-transactions-panel";
import { SendErc20Form } from "@/components/send-erc20-form";
import { SendEthForm } from "@/components/send-eth-form";
import {
  getValidWalletAddressFromParams,
  type WalletAddressRouteParams,
} from "@/lib/utils/wallet-address";

type Props = {
  params: Promise<WalletAddressRouteParams>;
};

export default async function WalletSendPage({ params }: Props) {
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
      <h1 className="text-2xl font-semibold">Send - Sign - Execute</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <SendEthForm walletAddress={walletAddress} />
        <SendErc20Form walletAddress={walletAddress} />
      </div>
      <PendingTransactionsPanel walletAddress={walletAddress} />
    </section>
  );
}
