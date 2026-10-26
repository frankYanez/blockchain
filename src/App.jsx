import { useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useReadContract, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { formatUnits, parseUnits } from 'viem'
import {
  EXPLORER_URL,
  MERCHANT_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
  usdcAbi,
} from './usdc.js'
import { products } from './products.js'
import { usePurchase } from './usePurchase.js'
import { ProductCard } from './ProductCard.jsx'

const STATUS_TEXT = {
  signing: 'Confirm the payment in your wallet...',
  confirming: 'Transaction sent. Waiting for it to be mined...',
  confirmed: 'Payment verified on-chain. Your download is unlocked!',
  rejected: 'The wallet did not send the transaction.',
  failed: 'Payment could not be verified.',
}

function App() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const purchase = usePurchase()
  const onRightChain = chainId === baseSepolia.id

  // READ: free, no signature, no gas
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: [address],
    chainId: baseSepolia.id,
    query: { enabled: Boolean(address) },
  })

  useEffect(() => {
    if (purchase.status === 'confirmed') refetchBalance()
  }, [purchase.status, refetchBalance])

  function blockReason(product) {
    if (!MERCHANT_ADDRESS) return 'Store wallet is not configured'
    if (!isConnected) return 'Connect your wallet first'
    if (!onRightChain) return 'Switch to Base Sepolia'
    if (purchase.busy) return 'Another payment is in progress'
    if (balance === undefined) return 'Loading balance...'
    if (balance < parseUnits(product.price, USDC_DECIMALS)) return 'Not enough USDC'
    return null
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>Kirby Store</h1>
          <p className="muted">Digital art paid with USDC on Base Sepolia</p>
        </div>
        <ConnectButton />
      </header>

      {!MERCHANT_ADDRESS && (
        <p className="banner banner-error">
          VITE_MERCHANT_ADDRESS is missing. Purchases are disabled.
        </p>
      )}

      {isConnected && !onRightChain && (
        <p className="banner banner-warning">
          Wrong network.{' '}
          <button
            className="button"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: baseSepolia.id })}
          >
            Switch to Base Sepolia
          </button>
        </p>
      )}

      {isConnected && onRightChain && (
        <p className="banner">
          USDC balance:{' '}
          <strong>
            {balance !== undefined ? formatUnits(balance, USDC_DECIMALS) : 'Loading...'}
          </strong>
          {' · '}
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer">
            Get test USDC
          </a>
        </p>
      )}

      {purchase.status !== 'idle' && (
        <section className={`status status-${purchase.status}`} aria-live="polite">
          <strong>{purchase.product?.name}</strong>
          <p>{STATUS_TEXT[purchase.status]}</p>
          {purchase.error && <p className="muted">{purchase.error}</p>}
          {purchase.hash && (
            <a href={`${EXPLORER_URL}/tx/${purchase.hash}`} target="_blank" rel="noreferrer">
              View transaction on BaseScan
            </a>
          )}
        </section>
      )}

      <section className="grid">
        {products.map((product) => {
          const reason = blockReason(product)
          return (
            <ProductCard
              key={product.id}
              product={product}
              purchased={Boolean(purchase.purchases[product.id])}
              disabled={Boolean(reason)}
              disabledReason={reason ?? undefined}
              onBuy={purchase.buy}
            />
          )
        })}
      </section>

      {MERCHANT_ADDRESS && (
        <footer className="muted footer">
          Payments go to <code>{MERCHANT_ADDRESS}</code>
        </footer>
      )}
    </main>
  )
}

export default App
