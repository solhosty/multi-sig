import { PendingTransactionsPanel } from "@/components/pending-transactions-panel";
import { SendErc20Form } from "@/components/send-erc20-form";
import { SendEthForm } from "@/components/send-eth-form";

type Props = {
  params: {
    walletAddress: `0x${string}`;
  };
};

export default function WalletSendPage({ params }: Props) {
  const walletAddress = params.walletAddress;

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
