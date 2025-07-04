import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession, sessionToJSON } from '@/lib/sessionStore'


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
    
    // Reset all player votes
    session.players.forEach(player => {
      player.score = null
      player.hasVoted = false
      player.lastActive = Date.now()
    })
    
    session.revealed = false
    session.averageScore = null
    updateSession(session)

    return NextResponse.json({ session: sessionToJSON(session) })
  } catch (error) {
    console.error('Reset votes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
