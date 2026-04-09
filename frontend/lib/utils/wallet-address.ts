import { getAddress, isAddress, type Address } from "viem";

export type WalletAddressRouteParams = {
  walletAddress: string;
};

export const getValidWalletAddress = (value: string): Address | null => {
  if (!isAddress(value)) {
    return null;
  }

  return getAddress(value);
};

export const getValidWalletAddressFromParams = (
  params: WalletAddressRouteParams,
): Address | null => getValidWalletAddress(params.walletAddress);
