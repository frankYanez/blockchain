import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'

// WalletConnect project ID (free at https://cloud.reown.com).
// Only needed for mobile/QR wallets; MetaMask in the browser works without it.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID'

export const config = getDefaultConfig({
  appName: 'Tienda USDC',
  projectId,
  chains: [baseSepolia], // chain ID 84532
  transports: {
    [baseSepolia.id]: http(),
  },
})
