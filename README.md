# DeploX — In-Feed X Player Card Meme Launcher & Bonding Curve Terminal

DeploX turns an X (Twitter) post into an in-feed meme token factory and instant trading terminal without relying on browser wallet extensions (`Phantom`, `MetaMask`) which are blocked inside sandboxed iframe embeds.

---

## 🛠️ The Core Problem Solved

When X renders a link as a **Player Card**, it isolates the page inside a sandboxed cross-origin `<iframe>`:
1. **Extension Injection Is Blocked:** `window.solana` or `window.ethereum` are never injected into third-party iframes.
2. **Deep-linking Breaks on Mobile:** Clicking standard WalletConnect links inside X’s in-app WebView often crashes the view or refreshes the page, resetting WebSockets.
3. **Approval Friction:** Normal DEX workflows require 3-5 popup hops (`Connect -> Approve Gas -> Confirm Swap`).

---

## 🚀 DeploX 3 Working Architectures

1. **In-Iframe Keypair / Passkey Model:**
   - Ephemeral Solana keypair generated and stored directly in local sandbox storage or Privy/Dynamic MPC session.
   - User signs micro-transactions programmatically in-memory: **0 popups, 1-tap trades, instant execution**.
2. **Telegram-Bot Style Relayer (QR Deposit):**
   - User scans ephemeral deposit QR code and transfers 0.1 SOL.
   - Public RPC listener credits the live session in <400ms.
   - User executes trades; transactions are dispatched to the on-chain bonding curve.
   - Non-custodial guarantee: User can click **"Export Private Key"** or **"Withdraw"** at any moment.
3. **Blink / Player Card Hybrid:**
   - Visual real-time tick chart and factory live inside the Player Card.
   - Native Solana Action URL attached to tweet metadata for Blink-enabled clients.

---

## 📦 Project Structure

```
DeploX/
├── anchor/
│   └── programs/
│       └── deplox_bonding_curve/
│           └── src/lib.rs        # Production Anchor Solana Bonding Curve Contract
├── src/
│   ├── components/
│   │   ├── ArchitectureGuide.tsx # Interactive technical spec & models guide
│   │   ├── BondingCurveChart.tsx # SVG live price sparkline & Raydium progress
│   │   ├── DepositModal.tsx      # QR code deposit, withdraw & private key export
│   │   ├── PlayerCardEmbed.tsx   # Exact 600x520 Player Card embed UI
│   │   ├── TokenDeployerModal.tsx# In-Feed SPL token deployer
│   │   ├── TradeTerminal.tsx     # 1-Tap Ape & Sell terminal
│   │   └── TwitterFeedMock.tsx   # Realistic X post timeline sandbox container
│   ├── services/
│   │   ├── bondingCurve.ts       # Bonding curve market math & trade state
│   │   └── sessionWallet.ts      # @solana/web3.js session keypair engine
│   ├── App.tsx                   # Main app switcher (Feed / Player Card / Architecture)
│   ├── index.css                 # Glassmorphic cyber theme & neon accents
│   └── main.tsx
├── index.html                    # Real Twitter Player Card meta tags
└── vite.config.ts                # Vite config with Node polyfills for Solana Web3
```

---

## 💻 Running the App

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```
