export const factoryAbi = [
  {
    type: "function",
    name: "createWallet",
    stateMutability: "nonpayable",
    inputs: [
      { name: "owners", type: "address[]" },
      { name: "threshold", type: "uint256" }
    ],
    outputs: [{ name: "walletAddress", type: "address" }]
  },
  {
    type: "function",
    name: "getWalletCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "getWalletsByCreator",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    type: "function",
    name: "getWalletsByOwner",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    type: "function",
    name: "registerAsOwner",
    stateMutability: "nonpayable",
    inputs: [{ name: "walletAddress", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    name: "unregisterAsOwner",
    stateMutability: "nonpayable",
    inputs: [{ name: "walletAddress", type: "address" }],
    outputs: []
  },
  {
    type: "event",
    name: "WalletCreated",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "wallet", type: "address", indexed: true },
      { name: "owners", type: "address[]", indexed: false },
      { name: "threshold", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnerRegistered",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "wallet", type: "address", indexed: true }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "OwnerUnregistered",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "wallet", type: "address", indexed: true }
    ],
    anonymous: false
  }
] as const;
