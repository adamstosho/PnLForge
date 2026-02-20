import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { updateTradeAnnotation } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const { walletAddress, valid } = verifyJWT(token)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { note, tags = [], reviewed = false } = await request.json()
    const tradeId = params.id

    if (!tradeId) {
      return NextResponse.json(
        { error: 'Trade ID is required' },
        { status: 400 }
      )
    }

    // Update trade annotation in database
    const updated = await updateTradeAnnotation(
      tradeId,
      note || '',
      tags,
      reviewed,
      walletAddress
    )

    return NextResponse.json({
      success: true,
      trade: updated,
      message: 'Annotation saved successfully',
    })
  } catch (error) {
    console.error('Error saving annotation:', error)
    return NextResponse.json(
      { error: 'Failed to save annotation' },
      { status: 500 }
    )
  }
}
