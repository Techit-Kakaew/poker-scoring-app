import { NextRequest, NextResponse } from 'next/server'
import { cleanupSessions } from '@/lib/sessionStore'

export async function GET(_request: NextRequest) {
  try {
    cleanupSessions()
    return NextResponse.json({ success: true, message: 'Cleanup completed' })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
