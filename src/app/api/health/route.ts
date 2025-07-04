import { NextRequest, NextResponse } from 'next/server'
import { sessionStore } from '@/lib/sessionStore'


export async function GET(_request: NextRequest) {
  try {
    // Basic health check
    const timestamp = new Date().toISOString()
    const activeSessionsCount = sessionStore.size
    
    // Calculate total active players across all sessions
    let totalPlayers = 0
    sessionStore.forEach(session => {
      totalPlayers += session.players.size
    })

    return NextResponse.json({
      status: 'healthy',
      timestamp,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeSessionsCount,
      totalActivePlayers: totalPlayers,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
