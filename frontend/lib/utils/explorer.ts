import { appChain } from "@/lib/contracts/config";

export const txExplorerUrl = (hash: `0x${string}`): string =>
  `${appChain.blockExplorers.default.url}/tx/${hash}`;

export const addressExplorerUrl = (address: `0x${string}`): string =>
  `${appChain.blockExplorers.default.url}/address/${address}`;
