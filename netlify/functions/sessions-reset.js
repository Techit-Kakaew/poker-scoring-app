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
    const { sessionId, playerId } = JSON.parse(event.body)

    if (!sessionId || !playerId) {
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
    
    // Reset all player votes
    session.players.forEach(player => {
      player.score = null
      player.hasVoted = false
      player.lastActive = Date.now()
    })
    
    session.revealed = false
    session.averageScore = null
    updateSession(session)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ session: sessionToJSON(session) })
    }
  } catch (error) {
    console.error('Reset votes error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
