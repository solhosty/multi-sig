import { sepolia } from "viem/chains";

export const appChain = sepolia;

export const contractConfig = {
  factoryAddress: (process.env["NEXT_PUBLIC_FACTORY_ADDRESS"] ?? "") as `0x${string}`,
  rpcUrl: process.env["NEXT_PUBLIC_SEPOLIA_RPC_URL"] ?? "https://rpc.sepolia.org"
};
