const { getSession, updateSession, sessionToJSON } = require('./shared/sessionStore')

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { sessionId, playerId, score } = JSON.parse(event.body)

    if (!sessionId || !playerId || score === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
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
    
    if (!session.players.has(playerId)) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Player not found' })
      }
    }

    // Update player's vote
    const player = session.players.get(playerId)
    player.score = score
    player.hasVoted = true
    player.lastActive = Date.now()
    session.players.set(playerId, player)
    
    updateSession(session)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ session: sessionToJSON(session) })
    }
  } catch (error) {
    console.error('Vote error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
