import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession, sessionToJSON } from '@/lib/sessionStore'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, playerId, score } = await request.json()

    if (!sessionId || !playerId || score === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const session = getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    if (!session.players.has(playerId)) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Update player's vote
    const player = session.players.get(playerId)!
    player.score = score
    player.hasVoted = true
    player.lastActive = Date.now()
    session.players.set(playerId, player)
    
    updateSession(session)
    return NextResponse.json({ session: sessionToJSON(session) })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
