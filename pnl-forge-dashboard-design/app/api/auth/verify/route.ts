import { NextResponse } from 'next/server'
import * as nacl from 'tweetnacl'
import { PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { verifyJWT, issueJWT, verifyChallengeNonce, clearChallenge } from '@/lib/auth'
import { createOrUpdateUser, getUserByWallet } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const { walletAddress, signature, challenge } = await request.json()

        if (!walletAddress || !signature || !challenge) {
            return NextResponse.json(
                { error: 'Missing required fields: walletAddress, signature, challenge' },
                { status: 400 }
            )
        }

        // Step 1: Verify the challenge nonce hasn't expired
        if (!verifyChallengeNonce(walletAddress, challenge)) {
            return NextResponse.json(
                { error: 'Challenge expired or invalid. Request a new challenge.' },
                { status: 401 }
            )
        }

        // Step 2: Verify the signature
        try {
            const signatureUint8 = bs58.decode(signature)
            const messageUint8 = new TextEncoder().encode(challenge)
            const publicKeyUint8 = new PublicKey(walletAddress).toBytes()

            const isValid = nacl.sign.detached.verify(
                messageUint8,
                signatureUint8,
                publicKeyUint8
            )

            if (!isValid) {
                return NextResponse.json(
                    { error: 'Invalid signature. Could not verify wallet ownership.' },
                    { status: 401 }
                )
            }
        } catch (sigError) {
            console.error('Signature verification error:', sigError)
            return NextResponse.json(
                { error: 'Failed to verify signature format' },
                { status: 400 }
            )
        }

        // Step 3: Create or update user in database
        let user = await getUserByWallet(walletAddress)
        if (!user) {
            user = await createOrUpdateUser(walletAddress, {
                created_at: new Date().toISOString(),
            })
        } else {
            // Update last login
            await createOrUpdateUser(walletAddress, {
                last_login: new Date().toISOString(),
            })
        }

        // Step 4: Issue JWT tokens
        const { token, refreshToken, expiresIn } = issueJWT(walletAddress, user?.id)

        // Step 5: Clear the challenge nonce (prevent replay)
        clearChallenge(walletAddress)

        // Create response with tokens
        const response = NextResponse.json({
            success: true,
            walletAddress,
            userId: user?.id,
            token,
            expiresIn,
            message: 'Authentication successful',
        })

        // Set refresh token in httpOnly cookie (more secure)
        response.cookies.set({
            name: 'refreshToken',
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        })

        return response
    } catch (error) {
        console.error('Verify API Error:', error)
        return NextResponse.json(
            { error: 'Internal server error during authentication' },
            { status: 500 }
        )
    }
}
