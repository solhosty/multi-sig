# Frontend (Next.js)

Wallet-scoped UI for creating, monitoring, and operating Solhosty multi-sig wallets on Sepolia.

## Stack

- Next.js App Router
- React 19
- Tailwind CSS
- Wagmi + Viem
- React Query
- Sonner toasts

## Local Development

From this `frontend/` directory:

```bash
pnpm install
pnpm dev
```

Typecheck:

```bash
npx tsc --noEmit
```

## Main Routes

- `/` - landing page and quick entry points
- `/wallets` - discover imported/created wallets
- `/wallets/new` - deploy a new wallet from the factory
- `/wallets/import` - import an existing wallet by address
- `/wallets/[walletAddress]/dashboard` - wallet summary and pending work
- `/wallets/[walletAddress]/send` - propose ETH or ERC-20 transfers
- `/wallets/[walletAddress]/transactions` - transaction history and execution state
- `/wallets/[walletAddress]/settings` - submit owner/threshold governance updates

## Notes

- This app is Sepolia-first and expects chain/account state from the connected wallet.
- Contract interactions are route-scoped by wallet address.
