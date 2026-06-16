# Solhosty Multi-Sig Monorepo

Factory-first multi-sig with wallet-level isolation and wallet-scoped Next.js UX for Sepolia.

## Architecture

- `contracts/src/MultiSigWallet.sol`
  - submit -> sign -> execute transaction lifecycle
  - ETH + arbitrary calldata execution (ERC-20 transfer via encoded calldata)
  - owner and threshold governance changes are `onlySelf` and must execute through standard multi-sig proposals
- `contracts/src/MultiSigFactory.sol`
  - deploys independent `MultiSigWallet` instances
  - indexes wallets by creator and owner
  - emits `WalletCreated` for app discovery
- `frontend/`
  - App Router wallet-scoped pages: dashboard, send, transactions, settings
  - create/import onboarding
  - pending tx status, signer matrix, and sign/execute actions
  - Sepolia quick-send walkthrough

## Workspace Commands

From repo root:

```bash
pnpm install
npx tsc --noEmit
pnpm dev
pnpm build:contracts
pnpm test:contracts
pnpm deploy:sepolia
```

## Contracts

### Build and test

```bash
cd contracts
forge build
forge test
```

### Deploy to Sepolia (factory)

Set variables in `.env` from `.env.example`, then:

```bash
pnpm deploy:sepolia
```

### Optional direct wallet helper

```bash
cd contracts
forge script script/Deploy.s.sol:DeployDirectWalletScript --rpc-url $SEPOLIA_RPC_URL --broadcast
```

## Frontend Flow

Landing -> Create New Wallet or Import Wallet -> wallet-scoped dashboard

Wallet operations are route-scoped by address:

- `/wallets/[walletAddress]/send`
  - propose ETH send
  - propose ERC-20 send (encodes token `transfer` calldata)
- `/wallets/[walletAddress]/transactions`
  - pending and executed transactions
  - signature count vs threshold
  - per-owner signer matrix and sign/execute actions
- `/wallets/[walletAddress]/settings`
  - propose owner/threshold governance updates through self-targeted multi-sig txs

## UI Polish

- Unified primary actions under the shared `.btn-primary` class for consistent styling.
- Standardized button sizing into a 3-tier hierarchy: hero, standard, and compact.
- Enhanced hover feedback with a sliding accent gradient, stronger lift, and subtle glow.
- Added keyboard-visible focus ring and active press interaction for better accessibility.
- Centralized disabled behavior with reduced opacity and no pointer interactions.

## ETH Transfer Test Coverage

- `contracts/test/MultiSigWallet.t.sol`
  - funds wallet with ETH
  - proposes ETH transfer
  - collects signatures
  - executes and asserts exact recipient/wallet balance changes
- `contracts/test/MultiSigFactory.t.sol`
  - creates multiple factory wallets
  - funds each independently
  - executes independent ETH transfers
  - asserts no cross-wallet interference
