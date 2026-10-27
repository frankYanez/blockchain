import { getAddress, isAddress, parseEventLogs } from 'viem'

// USDC contract on Base Sepolia (official Circle deployment)
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

// USDC uses 6 decimals, not 18: 1 USDC = 1_000_000 base units
export const USDC_DECIMALS = 6

// Store wallet that receives every payment. Set it in .env / Vercel env vars.
const merchant = import.meta.env.VITE_MERCHANT_ADDRESS
export const MERCHANT_ADDRESS = isAddress(merchant ?? '') ? getAddress(merchant) : null

export const EXPLORER_URL = 'https://sepolia.basescan.org'

// Minimal ABI: only the functions and events this app uses
export const usdcAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
]

// A mined transaction is not proof of payment by itself: it could have
// reverted, or moved a different amount/token. We look inside the receipt for
// a USDC Transfer event that matches buyer, merchant and exact price.
export function verifyPayment(receipt, { from, to, amount }) {
  if (receipt.status !== 'success') {
    return { ok: false, reason: 'Transaction reverted on-chain.' }
  }

  const transfers = parseEventLogs({ abi: usdcAbi, eventName: 'Transfer', logs: receipt.logs })
  const match = transfers.find(
    (log) =>
      log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
      log.args.from.toLowerCase() === from.toLowerCase() &&
      log.args.to.toLowerCase() === to.toLowerCase() &&
      log.args.value === amount,
  )

  return match
    ? { ok: true }
    : { ok: false, reason: 'No matching USDC transfer to the store was found in the receipt.' }
}
