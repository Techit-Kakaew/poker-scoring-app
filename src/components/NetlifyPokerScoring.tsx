'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Users, Eye, RotateCcw, Calculator, Wifi, WifiOff, Copy, Check } from 'lucide-react'

const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

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
  players: Player[]
  revealed: boolean
  averageScore: number | null
  lastUpdated: number
}

export default function NetlifyPokerScoring() {
  const [session, setSession] = useState<PokerSession>({
    id: '',
    story: '',
    players: [],
    revealed: false,
    averageScore: null,
    lastUpdated: Date.now()
  })
  
  const [currentPlayerName, setCurrentPlayerName] = useState('')
  const [currentPlayerId, setCurrentPlayerId] = useState('')
  const [sessionIdInput, setSessionIdInput] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [copied, setCopied] = useState(false)
  const [connected, setConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<number>(0)

  // Generate session ID and player ID on mount
  useEffect(() => {
    if (!currentPlayerId) {
      setCurrentPlayerId(Math.random().toString(36).substr(2, 9))
    }
    if (!sessionIdInput) {
      setSessionIdInput(Math.random().toString(36).substr(2, 8).toUpperCase())
    }
  }, [currentPlayerId, sessionIdInput])

  // Detect if we're on Netlify or Vercel
  const getApiUrl = (endpoint: string) => {
    if (typeof window !== 'undefined') {
      // Check if we're on Netlify (has .netlify in URL or netlify.app domain)
      const isNetlify = window.location.hostname.includes('netlify') || 
                       window.location.hostname.includes('.app')
      
      if (isNetlify) {
        // Use Netlify Functions
        return `/.netlify/functions/${endpoint.replace('/api/sessions/', 'sessions-').replace('/api/', '')}`
      }
    }
    // Default to Next.js API routes (Vercel)
    return endpoint
  }

  // Polling for real-time updates
  useEffect(() => {
    if (!hasJoined || !session.id) return

    const pollForUpdates = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/sessions/${session.id}?playerId=${currentPlayerId}&lastUpdate=${lastUpdateRef.current}`))
        if (response.ok) {
          const data = await response.json()
          if (data.session && data.session.lastUpdated > lastUpdateRef.current) {
            setSession(data.session)
            lastUpdateRef.current = data.session.lastUpdated
          }
          setConnected(true)
        }
      } catch (error) {
        console.error('Polling error:', error)
        setConnected(false)
      }
    }

    // Poll every 2 seconds for updates
    pollingRef.current = setInterval(pollForUpdates, 2000)
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [hasJoined, session.id, currentPlayerId])

  // Heartbeat to keep player active
  useEffect(() => {
    if (!hasJoined || !session.id) return

    const heartbeat = async () => {
      try {
        await fetch(getApiUrl('/api/sessions/heartbeat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            playerId: currentPlayerId
          })
        })
      } catch (error) {
        console.error('Heartbeat error:', error)
      }
    }

    const heartbeatInterval = setInterval(heartbeat, 30000) // Every 30 seconds
    
    return () => clearInterval(heartbeatInterval)
  }, [hasJoined, session.id, currentPlayerId])

  const handleJoinSession = async () => {
    if (!currentPlayerName.trim() || !sessionIdInput.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(getApiUrl('/api/sessions/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdInput,
          player: {
            id: currentPlayerId,
            name: currentPlayerName,
            score: null,
            hasVoted: false
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        setHasJoined(true)
        lastUpdateRef.current = data.session.lastUpdated
        setConnected(true)
      } else {
        alert('Failed to join session')
      }
    } catch (error) {
      console.error('Join session error:', error)
      alert('Failed to join session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStory = async (story: string) => {
    setSession(prev => ({ ...prev, story }))
    
    try {
      await fetch(getApiUrl('/api/sessions/update-story'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          story,
          playerId: currentPlayerId
        })
      })
    } catch (error) {
      console.error('Update story error:', error)
    }
  }

  const handleCastVote = async (score: number) => {
    try {
      const response = await fetch(getApiUrl('/api/sessions/vote'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          playerId: currentPlayerId,
          score
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        lastUpdateRef.current = data.session.lastUpdated
      }
    } catch (error) {
      console.error('Cast vote error:', error)
    }
  }

  const handleRevealVotes = async () => {
    try {
      const response = await fetch(getApiUrl('/api/sessions/reveal'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          playerId: currentPlayerId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        lastUpdateRef.current = data.session.lastUpdated
      }
    } catch (error) {
      console.error('Reveal votes error:', error)
    }
  }

  const handleResetVotes = async () => {
    try {
      const response = await fetch(getApiUrl('/api/sessions/reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          playerId: currentPlayerId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
        lastUpdateRef.current = data.session.lastUpdated
      }
    } catch (error) {
      console.error('Reset votes error:', error)
    }
  }

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionIdInput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentPlayer = session.players.find(p => p.id === currentPlayerId)
  const allPlayersVoted = session.players.length > 0 && session.players.every(p => p.hasVoted)
  const votedCount = session.players.filter(p => p.hasVoted).length

  if (!hasJoined) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Team Poker Scoring
          </h1>
          <p className="text-gray-600 mb-4">
            Real-time collaborative story point estimation
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">Disconnected</span>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join or Create Session
            </CardTitle>
            <CardDescription>
              Enter your name and session ID to start collaborating
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="player-name">Your Name</Label>
              <Input
                id="player-name"
                value={currentPlayerName}
                onChange={(e) => setCurrentPlayerName(e.target.value)}
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && document.getElementById('session-id')?.focus()}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="session-id">Session ID</Label>
              <div className="flex gap-2">
                <Input
                  id="session-id"
                  value={sessionIdInput}
                  onChange={(e) => setSessionIdInput(e.target.value.toUpperCase())}
                  placeholder="Enter session ID"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copySessionId}
                  title="Copy session ID"
                  disabled={isLoading}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this ID with your team members
              </p>
            </div>
            
            <Button 
              onClick={handleJoinSession} 
              disabled={!currentPlayerName.trim() || !sessionIdInput.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Joining...' : 'Join Session'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Team Poker Scoring
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Reconnecting...</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Session: {session.id}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySessionId}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Story Input */}
      <Card>
        <CardHeader>
          <CardTitle>Story to Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={session.story}
            onChange={(e) => handleUpdateStory(e.target.value)}
            placeholder="Describe the story or feature to estimate..."
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Current Players */}
      <Card>
        <CardHeader>
          <CardTitle>
            Players ({session.players.length})
          </CardTitle>
          <CardDescription>
            {votedCount} of {session.players.length} have voted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {session.players.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-lg border-2 ${
                  player.id === currentPlayerId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{player.name}</span>
                  <div className="flex items-center gap-2">
                    {player.hasVoted && (
                      <Badge variant="secondary" className="text-xs">
                        Voted
                      </Badge>
                    )}
                    {session.revealed && player.score !== null && (
                      <Badge variant="outline" className="text-lg font-bold">
                        {player.score}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voting Interface */}
      {currentPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>Your Vote</CardTitle>
            <CardDescription>
              Select your estimate using the Fibonacci sequence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-4">
              {FIBONACCI_SEQUENCE.map((value) => (
                <Button
                  key={value}
                  variant={currentPlayer.score === value ? "default" : "outline"}
                  size="lg"
                  className="h-16 text-xl font-bold"
                  onClick={() => handleCastVote(value)}
                  disabled={session.revealed}
                >
                  {value}
                </Button>
              ))}
            </div>
            
            {currentPlayer.hasVoted && !session.revealed && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ You voted {currentPlayer.score}! Waiting for others...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleRevealVotes}
          disabled={!allPlayersVoted || session.revealed}
          size="lg"
          className="flex items-center gap-2"
        >
          <Eye className="h-5 w-5" />
          Reveal Votes
        </Button>
        
        <Button
          onClick={handleResetVotes}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-5 w-5" />
          Reset Votes
        </Button>
      </div>

      {/* Results */}
      {session.revealed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  Average: {session.averageScore?.toFixed(1)}
                </p>
                <p className="text-gray-600">
                  Suggested story points: {Math.round(session.averageScore || 0)}
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-semibold">Individual Votes:</h4>
                {session.players
                  .filter(p => p.hasVoted)
                  .sort((a, b) => (a.score || 0) - (b.score || 0))
                  .map((player) => (
                    <div key={player.id} className="flex justify-between items-center">
                      <span>{player.name}</span>
                      <Badge variant="outline" className="text-lg">
                        {player.score}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
