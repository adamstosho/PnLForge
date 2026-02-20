import { NextResponse } from 'next/server'
import { generateChallenge } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { walletAddress } = await request.json()

        if (!walletAddress) {
            console.error('[Challenge API] Missing walletAddress in request body')
            return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
        }

        // Validate wallet address format (Solana base58)
        if (!/^[1-9A-HJ-NP-Z]{32,44}$/.test(walletAddress)) {
            console.error('[Challenge API] Invalid wallet address format:', walletAddress)
            return NextResponse.json(
                { error: 'Invalid Solana wallet address' },
                { status: 400 }
            )
        }

        // Generate secure challenge with nonce caching
        const challenge = generateChallenge(walletAddress)

        return NextResponse.json({
            challenge,
            expiresIn: 300, // 5 minutes
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Challenge API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
