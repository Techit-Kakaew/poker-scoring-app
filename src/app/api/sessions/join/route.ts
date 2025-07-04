import { NextRequest, NextResponse } from 'next/server'
import { getSession, createSession, updateSession, sessionToJSON } from '@/lib/sessionStore'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, player } = await request.json()

    if (!sessionId || !player) {
      return NextResponse.json({ error: 'Missing sessionId or player' }, { status: 400 })
    }

    // Get existing session or create new one
    let session = getSession(sessionId)
    if (!session) {
      session = createSession(sessionId)
    }
    
    // Add player to session
    const playerWithTimestamp = {
      ...player,
      lastActive: Date.now()
    }
    
    session.players.set(player.id, playerWithTimestamp)
    updateSession(session)

    return NextResponse.json({ session: sessionToJSON(session) })
  } catch (error) {
    console.error('Join session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
