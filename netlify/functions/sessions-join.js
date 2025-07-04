const { getSession, createSession, updateSession, sessionToJSON } = require('./shared/sessionStore')

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { sessionId, player } = JSON.parse(event.body)

    if (!sessionId || !player) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing sessionId or player' })
      }
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ session: sessionToJSON(session) })
    }
  } catch (error) {
    console.error('Join session error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
