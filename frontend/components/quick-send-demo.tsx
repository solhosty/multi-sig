"use client";

type Props = {
  walletAddress: `0x${string}`;
};

export const QuickSendDemo = ({ walletAddress }: Props) => {
  return (
    <div className="panel p-4 text-sm">
      <h3 className="font-semibold">Sepolia Quick Demo</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-700 dark:text-slate-300">
        <li>Fund <span className="font-mono">{walletAddress}</span> with Sepolia ETH</li>
        <li>Open Send tab and propose ETH or ERC-20 transfer</li>
        <li>Collect signatures from wallet owners</li>
        <li>Execute once threshold is reached</li>
        <li>Verify transfer hash on Sepolia explorer</li>
      </ol>
    </div>
  );
};
