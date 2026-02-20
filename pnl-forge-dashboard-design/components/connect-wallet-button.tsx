'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useFilters } from '@/lib/filter-context'
import { cn } from '@/lib/utils'

export interface ConnectWalletButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  redirectAfterConnect?: string
}

export function ConnectWalletButton({
  className,
  variant = 'primary',
  redirectAfterConnect
}: ConnectWalletButtonProps) {
  const { connected, publicKey } = useWallet()
  const { isSyncing } = useFilters()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && connected && redirectAfterConnect) {
      router.push(redirectAfterConnect)
    }
  }, [mounted, connected, redirectAfterConnect, router])

  // Prevent hydration mismatch by rendering a stable skeleton until mounted
  if (!mounted) {
    return (
      <div className={cn('connect-wallet-wrapper relative', className)}>
        <div className={cn(
          "h-12 px-10 rounded-lg !font-black !text-xs !uppercase !tracking-[0.1em] !flex !items-center !justify-center !gap-3",
          variant === 'primary' && "alpha-button-gradient opacity-50",
          variant === 'secondary' && "secondary-button-gradient opacity-50",
          (variant !== 'primary' && variant !== 'secondary') && "bg-muted-100 dark:bg-muted-800"
        )}>
          {/* Static placeholder text to match generic button structure */}
          <span className="opacity-0">Connect Wallet</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('connect-wallet-wrapper relative transition-all duration-300', className)}>
      <WalletMultiButton
        className={cn(
          "!transition-all !rounded-lg !font-black !h-12 !px-10 !text-xs !uppercase !tracking-[0.1em] !shadow-2xl !border-none !flex !items-center !justify-center !gap-3 !text-white",
          variant === 'primary' && "alpha-button-gradient hover:!shadow-[0_0_30px_rgba(123,92,255,0.5)] active:!scale-95",
          variant === 'secondary' && "secondary-button-gradient hover:!shadow-[0_0_30px_rgba(123,92,255,0.5)] active:!scale-95",
          (variant !== 'primary' && variant !== 'secondary') && "!bg-surface !text-muted-900 !border-2 !border-muted-200 hover:!border-primary-400 active:!scale-95",
          isSyncing && "!opacity-70 !pointer-events-none"
        )}
      >
        {isSyncing ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Syncing Alpha...</span>
          </div>
        ) : undefined}
      </WalletMultiButton>

      {connected && (
        <div className="hidden md:flex flex-col absolute top-16 right-0 bg-surface border-2 border-primary-100 dark:border-primary-900 rounded-xl p-4 shadow-2xl z-50 min-w-[240px] animate-in fade-in slide-in-from-top-3 duration-500">
          <div className="flex items-center gap-2.5 mb-3">
            <div className={cn(
              "w-2.5 h-2.5 rounded-full",
              isSyncing ? "bg-primary-500 animate-pulse" : "bg-success shadow-[0_0_8px_rgba(22,163,74,0.5)]"
            )} />
            <p className="text-[10px] text-muted-900 uppercase font-black tracking-[0.15em]">
              {isSyncing ? 'Synchronizing Alpha' : 'On-Chain Verified'}
            </p>
          </div>
          <p className="text-[11px] text-muted-700 dark:text-muted-400 font-mono break-all font-bold bg-muted-50 dark:bg-muted-900 p-3 rounded-md border border-muted-100 dark:border-muted-800">
            {publicKey?.toBase58()}
          </p>
        </div>
      )}

      <style jsx global>{`
        .connect-wallet-wrapper .wallet-adapter-button {
          font-family: var(--font-sans);
          letter-spacing: 0.1em;
        }
        .connect-wallet-wrapper .wallet-adapter-modal-wrapper {
          background: var(--color-surface) !important;
          border: 1px solid var(--color-muted-300) !important;
          border-radius: var(--radius-xl) !important;
          box-shadow: var(--box-shadow-lg) !important;
          color: var(--color-muted-900) !important;
        }
        .connect-wallet-wrapper .wallet-adapter-modal-button-close {
          background: var(--color-muted-100) !important;
        }
        .connect-wallet-wrapper .wallet-adapter-modal-title {
          font-family: var(--font-sans) !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: var(--color-muted-900) !important;
        }
        .connect-wallet-wrapper .wallet-adapter-modal-list {
          margin: 0 0 12px !important;
        }
        .connect-wallet-wrapper .wallet-adapter-button {
          height: 48px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }
        .connect-wallet-wrapper .wallet-adapter-modal-list .wallet-adapter-button {
          color: var(--color-muted-800) !important;
        }
        .connect-wallet-wrapper .wallet-adapter-modal-list .wallet-adapter-button:hover {
          background: var(--color-muted-100) !important;
        }
      `}</style>
    </div>
  )
}
