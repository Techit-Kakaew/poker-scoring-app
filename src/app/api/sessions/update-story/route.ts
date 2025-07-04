import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession, sessionToJSON } from '@/lib/sessionStore'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, story, playerId } = await request.json()

    if (!sessionId || story === undefined || !playerId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const session = getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Update story
    session.story = story
    
    // Update player's last active time
    if (session.players.has(playerId)) {
      const player = session.players.get(playerId)!
      player.lastActive = Date.now()
      session.players.set(playerId, player)
    }

    updateSession(session)
    return NextResponse.json({ session: sessionToJSON(session) })
  } catch (error) {
    console.error('Update story error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
