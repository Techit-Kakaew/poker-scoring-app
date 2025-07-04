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
    
    // Reveal votes
    session.revealed = true
    
    // Calculate average
    const votedPlayers = Array.from(session.players.values()).filter(p => p.hasVoted && p.score !== null)
    const average = votedPlayers.length > 0 
      ? votedPlayers.reduce((sum, p) => sum + (p.score || 0), 0) / votedPlayers.length
      : null
    
    session.averageScore = average
    updateSession(session)

    return NextResponse.json({ session: sessionToJSON(session) })
  } catch (error) {
    console.error('Reveal votes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
