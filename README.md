# Blockchain coursework

This repository contains two blockchain projects:

| Folder | Project | Stack | Network |
|--------|---------|-------|---------|
| [`oraculo/`](./oraculo) | Live crypto prices read from Chainlink Data Feeds (BTC/USD, ETH/USD, USDT/USD, plus BTC/USDT computed off-chain). Includes a console that logs every JSON-RPC request sent to the node. | HTML + [viem](https://viem.sh) | Ethereum mainnet (read-only) |
| [`tienda-usdc/`](./tienda-usdc) | Web store that charges in USDC and unlocks downloads only after the payment is verified on-chain. | React + Vite + wagmi + RainbowKit | Base Sepolia (testnet) |

## Run locally

### Oracle

```bash
cd oraculo
npx serve .   # or open index.html in a browser
```

No wallet needed: it only reads public contracts through a public RPC.

### USDC store

```bash
cd tienda-usdc
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

See [`tienda-usdc/README.md`](./tienda-usdc/README.md) for the demo link, test faucets, architecture and risks.

> The store's full commit history is preserved in this repository (imported with `git subtree`).
