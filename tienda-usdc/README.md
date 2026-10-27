# Kirby Store: tienda con pagos en USDC

Tienda web en React que vende imágenes digitales de Kirby y cobra en **USDC** sobre
**Base Sepolia** (testnet). El usuario conecta su wallet, paga un producto, la app sigue el
estado de la transacción y solo desbloquea la descarga cuando el pago está **verificado on-chain**.

- Demo: https://tienda-usdc.vercel.app
- Repo: https://github.com/frankYanez/tienda-usdc
- Red: Base Sepolia (chain ID `84532`)
- Contrato USDC (Circle): [`0x036CbD53842c5426634e7929541eC2318f3dCF7e`](https://sepolia.basescan.org/token/0x036CbD53842c5426634e7929541eC2318f3dCF7e)

## Cómo probarla

1. Instalar una wallet (MetaMask, Coinbase Wallet, Rabby...) y agregar Base Sepolia.
2. Conseguir fondos de prueba:
   - **USDC**: [faucet.circle.com](https://faucet.circle.com) → elegir Base Sepolia.
   - **ETH para gas**: [Coinbase CDP faucet](https://portal.cdp.coinbase.com/products/faucet) u otro faucet de Base Sepolia.
3. Abrir la demo, **Connect Wallet**, elegir un producto y **Buy**.
4. Firmar en la wallet → la app muestra *esperando firma → minando → verificado* → botón **Download**.

### Correr localmente

```bash
npm install
cp .env.example .env   # completar VITE_MERCHANT_ADDRESS
npm run dev
```

| Variable | Para qué |
|---|---|
| `VITE_MERCHANT_ADDRESS` | Wallet de la tienda que recibe los pagos. Sin ella, las compras quedan deshabilitadas. |
| `VITE_WALLETCONNECT_PROJECT_ID` | Opcional. Habilita wallets mobile por QR ([cloud.reown.com](https://cloud.reown.com)). MetaMask de escritorio funciona sin esto. |

## Flujo de una compra

```
 Usuario           React app (navegador)            Wallet            RPC Base Sepolia        Contrato USDC
    │  click Buy          │                            │                     │                      │
    │────────────────────>│ writeContract(transfer)    │                     │                      │
    │                     │───────────────────────────>│ firma y envía tx    │                      │
    │                     │                            │────────────────────>│─────────────────────>│ transfer()
    │                     │ waitForTransactionReceipt  │                     │   bloque minado      │ emite Transfer
    │                     │<─────────────────────────────────────────────────│                      │
    │                     │ verifyPayment(receipt):                          │                      │
    │                     │  status == success                               │                      │
    │                     │  log Transfer de USDC: from=buyer, to=tienda, value=precio exacto       │
    │  Download habilitado│                                                  │                      │
    │<────────────────────│                                                  │                      │
```

Que la tx esté minada **no alcanza** como prueba de pago: puede haber revertido o haber
movido otro monto u otro token. Por eso `verifyPayment` (en `src/usdc.js`) busca en el receipt
un evento `Transfer` del contrato USDC con comprador, tienda y monto exactos.

## Proveedores y herramientas elegidas

| Pieza | Elegí | Por qué | Alternativas |
|---|---|---|---|
| Red | **Base Sepolia** | L2 de Coinbase, gas casi gratis, USDC oficial de Circle y faucet propio. Pasar a mainnet es cambiar la chain. | Ethereum Sepolia, Arbitrum Sepolia, Polygon Amoy, Solana devnet |
| Stablecoin | **USDC (Circle)** | Es el que pide la consigna, el más usado para pagos y está nativo en Base. | USDT, EURC, PYUSD, DAI |
| Conexión a la wallet | **RainbowKit** + **WalletConnect** | Modal listo con MetaMask, Coinbase, Rainbow y QR mobile en pocas líneas. | Privy, Dynamic, Reown AppKit, ConnectKit, Coinbase OnchainKit |
| Librería Web3 | **wagmi** (hooks de React) + **viem** | Estándar actual del ecosistema EVM, tipado, cachea lecturas con TanStack Query. | ethers.js, web3.js, thirdweb SDK |
| RPC | **RPC público de Base** (`sepolia.base.org`) | Gratis y sin API key, alcanza para una demo. | Alchemy, Infura, QuickNode, Ankr, Coinbase CDP Node |
| Explorer | **BaseScan** | Link a cada tx para auditar el pago. | Blockscout |
| Hosting | **Vercel** | Deploy estático de Vite en un comando. | Netlify, Cloudflare Pages, IPFS (Fleek) |

**Por qué no un procesador de pagos:** la consigna pide entender la integración (conectar
wallet, consultar contratos, enviar y verificar transacciones). Una transferencia ERC-20
directa a la wallet de la tienda muestra todo el ciclo sin intermediarios. En producción
podría reemplazarse por **Coinbase Commerce / CDP Onchain Payments**, **Circle Payments** o
**Stripe crypto**, que agregan webhooks, conciliación y conversión a fiat.

## Qué es on-chain y qué off-chain

| On-chain (Base Sepolia) | Off-chain |
|---|---|
| Contrato USDC: saldos, `balanceOf`, `transfer` | App React estática servida por Vercel |
| La transacción de pago y su evento `Transfer` | Catálogo y precios (`src/products.js`) |
| El receipt (status, logs) que se usa como prueba | Imágenes (`public/products`) |
| | La wallet del usuario (firma local de la tx) |
| | Nodo RPC que la app usa para leer y enviar |
| | Registro de "ya compré esto" (localStorage) |

## Limitaciones, costos y riesgos

- **Sin backend: la verificación corre en el navegador.** Sirve para mostrar el estado, pero
  cualquiera puede descargar las imágenes desde `/products/...` sin pagar. Una tienda real
  necesita un backend que verifique la tx por RPC (o con un webhook de Alchemy o Coinbase
  Commerce) y entregue un link firmado y temporal.
- **Los precios viven en el frontend.** Un backend (o un contrato de tienda) debería ser la
  fuente de verdad del precio y registrar cada orden para evitar reusar una misma tx para dos
  compras.
- **RPC público:** tiene rate limits (por ejemplo, `eth_getLogs` está limitado a 200 bloques)
  y no hay SLA. Para producción conviene Alchemy, Infura o QuickNode con API key.
- **Costos:** el comprador paga gas en ETH (en Base son centavos de dólar o menos). En
  testnet todo es gratis. La tienda no paga nada por recibir.
- **UX:** el comprador necesita ETH además de USDC. Se resuelve con *account abstraction* y
  un paymaster (Coinbase CDP Paymaster, Pimlico, ZeroDev) que patrocine el gas.
- **Irreversibilidad:** un pago a una dirección equivocada no se puede revertir. Por eso la
  dirección de la tienda se valida (`isAddress`) y la red se fuerza a Base Sepolia.
- **Confirmaciones:** se acepta el pago con 1 confirmación. En mainnet, para montos altos,
  conviene esperar más bloques o la finalidad del L2.
- **Custodia:** los fondos van a una EOA. En producción conviene una **Safe** multisig.

## Estructura

```
src/
  usdc.js          dirección, ABI mínimo de USDC y verifyPayment()
  usePurchase.js   hook: firma → minado → verificación → desbloqueo
  products.js      catálogo
  ProductCard.jsx  tarjeta de producto
  App.jsx          layout, red, saldo, estado de la tx
  wagmi.js         config de wagmi/RainbowKit (Base Sepolia)
public/products/   ilustraciones SVG (fan art original)
```
