const { sessions } = require('./shared/sessionStore')

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

  try {
    // Basic health check
    const timestamp = new Date().toISOString()
    const activeSessionsCount = sessions.size
    
    // Calculate total active players across all sessions
    let totalPlayers = 0
    sessions.forEach(session => {
      totalPlayers += session.players.size
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        timestamp,
        platform: 'netlify',
        activeSessionsCount,
        totalActivePlayers: totalPlayers,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production'
      })
    }
  } catch (error) {
    console.error('Health check error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      })
    }
  }
}
