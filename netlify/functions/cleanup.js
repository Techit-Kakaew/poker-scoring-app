const { cleanupSessions } = require('./shared/sessionStore')

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
    cleanupSessions()
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Cleanup completed' })
    }
  } catch (error) {
    console.error('Cleanup error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Cleanup failed' })
    }
  }
}
