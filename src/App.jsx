import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { formatUnits, parseUnits, isAddress } from 'viem'
import { USDC_ADDRESS, USDC_DECIMALS, usdcAbi } from './usdc.js'

function App() {
  const { address, isConnected, chain } = useAccount()
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  // READ: free, no signature, no gas
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: Boolean(address) },
  })

  // WRITE: wallet asks the user to sign, costs gas (ETH)
  const { data: txHash, writeContract, isPending, error } = useWriteContract()

  // Wait until the transaction is mined into a block
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => {
    if (isConfirmed) refetchBalance()
  }, [isConfirmed, refetchBalance])

  function handlePay(event) {
    event.preventDefault()
    writeContract({
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: 'transfer',
      args: [to, parseUnits(amount, USDC_DECIMALS)],
    })
  }

  const canPay = isAddress(to) && Number(amount) > 0 && !isPending && !isConfirming

  return (
    <main className="app">
      <header className="app-header">
        <h1>Tienda USDC</h1>
        <ConnectButton />
      </header>

      {isConnected ? (
        <section>
          <p>Connected address: <code>{address}</code></p>
          <p>Network: {chain ? `${chain.name} (${chain.id})` : 'Unsupported network'}</p>
          <p>
            USDC balance:{' '}
            {balance !== undefined ? formatUnits(balance, USDC_DECIMALS) : 'Loading...'}
          </p>

          <form onSubmit={handlePay}>
            <input
              placeholder="Recipient address (0x...)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <input
              placeholder="Amount in USDC"
              type="number"
              min="0"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button type="submit" disabled={!canPay}>
              {isPending ? 'Confirm in wallet...' : isConfirming ? 'Confirming...' : 'Pay'}
            </button>
          </form>

          {txHash && <p>Transaction: <code>{txHash}</code></p>}
          {isConfirmed && <p>Payment confirmed.</p>}
          {error && <p>Error: {error.shortMessage ?? error.message}</p>}
        </section>
      ) : (
        <p>Connect your wallet to start.</p>
      )}
    </main>
  )
}

export default App
