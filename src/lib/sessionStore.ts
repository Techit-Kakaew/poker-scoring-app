// Shared session storage for Vercel serverless functions
// In production, replace this with Redis or a database

interface Player {
  id: string
  name: string
  score: number | null
  hasVoted: boolean
  lastActive: number
}

interface PokerSession {
  id: string
  story: string
  players: Map<string, Player>
  revealed: boolean
  averageScore: number | null
  lastUpdated: number
}

// Use global to persist across serverless function calls
declare global {
  var __sessionStore: Map<string, PokerSession> | undefined
}

if (!global.__sessionStore) {
  global.__sessionStore = new Map()
}

export const sessionStore = global.__sessionStore

export function getSession(sessionId: string): PokerSession | null {
  return sessionStore.get(sessionId) || null
}

export function createSession(sessionId: string): PokerSession {
  const session: PokerSession = {
    id: sessionId,
    story: '',
    players: new Map(),
    revealed: false,
    averageScore: null,
    lastUpdated: Date.now()
  }
  sessionStore.set(sessionId, session)
  return session
}

export function updateSession(session: PokerSession): void {
  session.lastUpdated = Date.now()
  sessionStore.set(session.id, session)
}

export function sessionToJSON(session: PokerSession) {
  return {
    ...session,
    players: Array.from(session.players.values())
  }
}

// Clean up inactive sessions (older than 24 hours)
export function cleanupSessions(): void {
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
  
  sessionStore.forEach((session, sessionId) => {
    if (session.lastUpdated < twentyFourHoursAgo) {
      sessionStore.delete(sessionId)
    }
  })
}

// Clean up inactive players (inactive for more than 5 minutes)
export function cleanupInactivePlayers(session: PokerSession): void {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const activePlayers = new Map<string, Player>()
  
  session.players.forEach((player, id) => {
    if (player.lastActive > fiveMinutesAgo) {
      activePlayers.set(id, player)
    }
  })
  
  session.players = activePlayers
}
