const { getSession, updateSession, sessionToJSON, cleanupInactivePlayers } = require('./shared/sessionStore')

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Extract sessionId from the path
    const pathParts = event.path.split('/')
    const sessionId = pathParts[pathParts.length - 1] || event.queryStringParameters?.sessionId
    
    const playerId = event.queryStringParameters?.playerId
    const lastUpdate = parseInt(event.queryStringParameters?.lastUpdate || '0')

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing sessionId' })
      }
    }

    const session = getSession(sessionId)
    if (!session) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Session not found' })
      }
    }
    
    // Update player's last active time if playerId is provided
    if (playerId && session.players.has(playerId)) {
      const player = session.players.get(playerId)
      player.lastActive = Date.now()
      session.players.set(playerId, player)
    }

    // Clean up inactive players
    cleanupInactivePlayers(session)

    // Only return updated data if there have been changes
    if (session.lastUpdated <= lastUpdate) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ session: null })
      }
    }

    updateSession(session)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ session: sessionToJSON(session) })
    }
  } catch (error) {
    console.error('Get session error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
