// Shared session storage for Netlify functions
// Note: This uses in-memory storage. For production, consider using
// external storage like Redis, Fauna, or Supabase

// Global storage that persists across function calls
const sessions = new Map()

const getSession = (sessionId) => {
  return sessions.get(sessionId) || null
}

const createSession = (sessionId) => {
  const session = {
    id: sessionId,
    story: '',
    players: new Map(),
    revealed: false,
    averageScore: null,
    lastUpdated: Date.now()
  }
  sessions.set(sessionId, session)
  return session
}

const updateSession = (session) => {
  session.lastUpdated = Date.now()
  sessions.set(session.id, session)
}

const sessionToJSON = (session) => {
  return {
    ...session,
    players: Array.from(session.players.values())
  }
}

const cleanupSessions = () => {
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
  
  sessions.forEach((session, sessionId) => {
    if (session.lastUpdated < twentyFourHoursAgo) {
      sessions.delete(sessionId)
    }
  })
}

const cleanupInactivePlayers = (session) => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  const activePlayers = new Map()
  
  session.players.forEach((player, id) => {
    if (player.lastActive > fiveMinutesAgo) {
      activePlayers.set(id, player)
    }
  })
  
  session.players = activePlayers
}

module.exports = {
  sessions,
  getSession,
  createSession,
  updateSession,
  sessionToJSON,
  cleanupSessions,
  cleanupInactivePlayers
}
