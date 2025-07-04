import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/sessionStore'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, playerId } = await request.json()

    if (!sessionId || !playerId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const session = getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Update player's last active time
    if (session.players.has(playerId)) {
      const player = session.players.get(playerId)!
      player.lastActive = Date.now()
      session.players.set(playerId, player)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Heartbeat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
