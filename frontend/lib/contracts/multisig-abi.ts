export const multisigAbi = [
  {
    type: "function",
    name: "threshold",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "isAdmin",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "isUser",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "getOwners",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    type: "function",
    name: "getTransactionCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "getTransaction",
    stateMutability: "view",
    inputs: [{ name: "txId", type: "uint256" }],
    outputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "executed", type: "bool" },
      { name: "signatureCount", type: "uint256" }
    ]
  },
  {
    type: "function",
    name: "hasSigned",
    stateMutability: "view",
    inputs: [
      { name: "txId", type: "uint256" },
      { name: "owner", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "submitTransaction",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" }
    ],
    outputs: [{ name: "txId", type: "uint256" }]
  },
  {
    type: "function",
    name: "signTransaction",
    stateMutability: "nonpayable",
    inputs: [{ name: "txId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "executeTransaction",
    stateMutability: "nonpayable",
    inputs: [{ name: "txId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "addOwner",
    stateMutability: "nonpayable",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    name: "removeOwner",
    stateMutability: "nonpayable",
    inputs: [{ name: "oldOwner", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    name: "updateThreshold",
    stateMutability: "nonpayable",
    inputs: [{ name: "newThreshold", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "grantAdmin",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    name: "revokeAdmin",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    name: "grantUser",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    name: "revokeUser",
    stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }],
    outputs: []
  },
  {
    type: "event",
    name: "AdminGranted",
    inputs: [{ name: "account", type: "address", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "AdminRevoked",
    inputs: [{ name: "account", type: "address", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "UserGranted",
    inputs: [{ name: "account", type: "address", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "UserRevoked",
    inputs: [{ name: "account", type: "address", indexed: true }],
    anonymous: false
  }
] as const;
