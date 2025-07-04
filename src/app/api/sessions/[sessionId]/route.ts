import { NextRequest, NextResponse } from 'next/server'
import { getSession, updateSession, sessionToJSON, cleanupInactivePlayers } from '@/lib/sessionStore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const url = new URL(request.url)
    const playerId = url.searchParams.get('playerId')
    const lastUpdate = parseInt(url.searchParams.get('lastUpdate') || '0')

    const session = getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Update player's last active time if playerId is provided
    if (playerId && session.players.has(playerId)) {
      const player = session.players.get(playerId)!
      player.lastActive = Date.now()
      session.players.set(playerId, player)
    }

    // Clean up inactive players
    cleanupInactivePlayers(session)

    // Only return updated data if there have been changes
    if (session.lastUpdated <= lastUpdate) {
      return NextResponse.json({ session: null })
    }

    updateSession(session)
    return NextResponse.json({ session: sessionToJSON(session) })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
