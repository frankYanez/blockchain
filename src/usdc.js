// USDC contract on Base Sepolia (official Circle deployment)
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

// USDC uses 6 decimals, not 18: 1 USDC = 1_000_000 base units
export const USDC_DECIMALS = 6

// Minimal ABI: only the functions this app calls
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
]
