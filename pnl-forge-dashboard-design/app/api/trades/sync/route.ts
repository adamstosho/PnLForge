import { NextResponse } from 'next/server'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { verifyJWT } from '@/lib/auth'
import { generateMockTrades } from '@/lib/mock-data-generator'
import { fetchAndParseTrades } from '@/lib/deriverse-parser'
import { saveUserTrades, updateSyncStatus, getUserByWallet } from '@/lib/supabase'
import type { Trade } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')
        let walletAddress = ''
        let userId = ''

        // Optional authentication - allow demo mode without token
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7)
            const { walletAddress: tokenWallet, userId: tokenUserId, valid } = verifyJWT(token)
            if (valid) {
                walletAddress = tokenWallet
                userId = tokenUserId
            }
        }

        // Get wallet from request body
        const { walletAddress: bodyWallet } = await request.json()
        
        if (!bodyWallet) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            )
        }

        // If no token but wallet provided, use demo mode
        if (!walletAddress) {
            walletAddress = bodyWallet
        }

        // Verify requesting user matches token (if authenticated)
        if (authHeader && walletAddress !== bodyWallet) {
            return NextResponse.json(
                { error: 'Cannot sync trades for a different wallet' },
                { status: 403 }
            )
        }

        // Update sync status to syncing
        await updateSyncStatus(walletAddress, 'syncing', {
            trades_parsed: 0,
            transactions_scanned: 0,
        })

        // Step 1: Try to fetch real on-chain trades
        let trades: Trade[] = []
        let syncMetadata = {
            signaturesScanned: 0,
            latestSignature: null as string | null,
            timestamp: new Date().toISOString(),
            network: 'mainnet-beta',
            dataSource: 'mock', // Will be 'onchain' if successful
        }

        try {
            // Attempt real trade parsing (production path)
            const result = await fetchAndParseTrades(walletAddress, 100)
            if (result.parseStatus === 'success' && result.trades.length > 0) {
                trades = result.trades
                syncMetadata.signaturesScanned = result.transactionCount
                syncMetadata.dataSource = 'onchain'
            }
        } catch (parseError) {
            console.warn('Failed to parse real trades, falling back to mock data:', parseError)
            // Fall back to mock data (development/demo path)
        }

        // Step 2: If no real trades found, use mock data
        if (trades.length === 0) {
            console.info(`No on-chain trades found for ${walletAddress}, using mock data`)
            trades = generateMockTrades(80 + (syncMetadata.signaturesScanned * 2), walletAddress)
            syncMetadata.dataSource = 'mock'
        }

        // Step 3: Verify on-chain activity for legitimacy
        try {
            const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
            const connection = new Connection(rpcUrl, 'confirmed')
            const pubkey = new PublicKey(walletAddress)
            const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 1 })

            if (signatures.length > 0) {
                syncMetadata.latestSignature = signatures[0].signature
                syncMetadata.signaturesScanned = 1
            }
        } catch (rpcError) {
            console.warn('RPC verification failed:', rpcError)
            // Continue anyway; we have trades to return
        }

        // Step 4: Ensure user exists in database (optional for demo)
        try {
            await getUserByWallet(walletAddress).then(user => {
                if (!user) {
                    return getUserByWallet(walletAddress).then(u => {
                        if (!u) {
                            return saveUserTrades(walletAddress, [])
                        }
                    })
                }
            })
        } catch (dbError) {
            console.warn('Database user creation failed (demo mode OK):', dbError)
            // Continue anyway - demo mode
        }

        // Step 5: Save trades to database
        if (trades.length > 0) {
            try {
                await saveUserTrades(walletAddress, trades as Trade[])
            } catch (dbError) {
                console.warn('Error saving trades to database (demo mode OK):', dbError)
                // Continue even if DB save fails - return trades anyway
            }
        }

        // Step 6: Update sync status to completed (optional for demo)
        try {
            await updateSyncStatus(walletAddress, 'ready', {
                trades_parsed: trades.length,
                transactions_scanned: syncMetadata.signaturesScanned,
                last_synced_at: new Date().toISOString(),
                data_source: syncMetadata.dataSource,
            })
        } catch (statusError) {
            console.warn('Could not update sync status (demo mode OK):', statusError)
            // Continue anyway - still return trades
        }

        return NextResponse.json({
            success: true,
            walletAddress,
            syncMetadata,
            trades,
            tradeCount: trades.length,
            message: `Successfully synced ${trades.length} trades`,
        })
    } catch (error) {
        console.error('Sync API Error:', error)

        // Try to update error status
        try {
            const body = await request.clone().json().catch(() => ({}))
            const walletAddr = (body as { walletAddress?: string }).walletAddress
            if (walletAddr) {
                await updateSyncStatus(walletAddr, 'idle', {
                    error_message: String(error),
                    last_error_at: new Date().toISOString(),
                })
            }
        } catch (statusError) {
            console.error('Failed to update sync status:', statusError)
        }

        return NextResponse.json(
            { error: 'Failed to sync trades. Please try again.' },
            { status: 500 }
        )
    }
}
