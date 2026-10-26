import { useEffect, useMemo, useState } from 'react'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { parseUnits } from 'viem'
import { MERCHANT_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, usdcAbi, verifyPayment } from './usdc.js'

const storageKey = (address) => `tienda-usdc:purchases:${address?.toLowerCase()}`

function loadPurchases(address) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(address))) ?? {}
  } catch {
    return {}
  }
}

function savePurchases(address, purchases) {
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(purchases))
  } catch {
    // Storage can be unavailable (private mode); purchases stay in memory.
  }
}

// Drives one purchase at a time: sign -> mine -> verify -> unlock.
export function usePurchase() {
  const { address } = useAccount()
  const [product, setProduct] = useState(null)

  const { data: hash, writeContract, isPending, error: writeError, reset } = useWriteContract()
  const {
    data: receipt,
    isLoading: isConfirming,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash, chainId: baseSepolia.id })

  const verification = useMemo(() => {
    if (!receipt || !product || !address) return null
    return verifyPayment(receipt, {
      from: address,
      to: MERCHANT_ADDRESS,
      amount: parseUnits(product.price, USDC_DECIMALS),
    })
  }, [receipt, product, address])

  // Purchased products map productId -> tx hash. A verified payment unlocks
  // its product immediately; localStorage keeps it across reloads.
  const purchases = useMemo(() => {
    const stored = address ? loadPurchases(address) : {}
    return verification?.ok ? { ...stored, [product.id]: receipt.transactionHash } : stored
  }, [address, verification, product, receipt])

  useEffect(() => {
    if (verification?.ok && address) savePurchases(address, purchases)
  }, [verification, address, purchases])

  function buy(item) {
    reset()
    setProduct(item)
    writeContract({
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: 'transfer',
      args: [MERCHANT_ADDRESS, parseUnits(item.price, USDC_DECIMALS)],
      chainId: baseSepolia.id,
    })
  }

  let status = 'idle'
  if (isPending) status = 'signing'
  else if (writeError) status = 'rejected'
  else if (isConfirming) status = 'confirming'
  else if (receiptError) status = 'failed'
  else if (verification?.ok) status = 'confirmed'
  else if (verification) status = 'failed'

  return {
    buy,
    product,
    hash,
    status,
    busy: status === 'signing' || status === 'confirming',
    error: writeError?.shortMessage ?? receiptError?.shortMessage ?? verification?.reason,
    purchases,
  }
}
