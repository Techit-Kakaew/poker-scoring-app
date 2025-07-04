'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Users, Eye, RotateCcw, Calculator, Wifi, WifiOff, Copy, Check } from 'lucide-react'
import { useSocket } from '@/contexts/SocketContext'

const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

interface Player {
  id: string
  name: string
  score: number | null
  hasVoted: boolean
  socketId?: string
}

interface PokerSession {
  id: string
  story: string
  players: Player[]
  revealed: boolean
  averageScore: number | null
}

export default function RealTimePokerScoring() {
  const { socket, connected, currentSessionId, joinSession, updateStory, castVote, revealVotes, resetVotes } = useSocket()
  
  const [session, setSession] = useState<PokerSession>({
    id: '',
    story: '',
    players: [],
    revealed: false,
    averageScore: null
  })
  
  const [currentPlayerName, setCurrentPlayerName] = useState('')
  const [currentPlayerId, setCurrentPlayerId] = useState('')
  const [sessionIdInput, setSessionIdInput] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generate session ID and player ID on mount
  useEffect(() => {
    if (!currentPlayerId) {
      setCurrentPlayerId(Math.random().toString(36).substr(2, 9))
    }
    if (!sessionIdInput) {
      setSessionIdInput(Math.random().toString(36).substr(2, 8).toUpperCase())
    }
  }, [currentPlayerId, sessionIdInput])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // Handle session state updates
    socket.on('session-state', (data) => {
      console.log('Session state received:', data)
      setSession(data.session)
      setHasJoined(true)
    })

    // Handle player joined
    socket.on('player-joined', (data) => {
      console.log('Player joined:', data)
      setSession(prev => ({
        ...prev,
        players: data.players
      }))
    })

    // Handle player left
    socket.on('player-left', (data) => {
      console.log('Player left:', data)
      setSession(prev => ({
        ...prev,
        players: data.players
      }))
    })

    // Handle story updates
    socket.on('story-updated', (data) => {
      console.log('Story updated:', data)
      setSession(prev => ({
        ...prev,
        story: data.story
      }))
    })

    // Handle vote cast
    socket.on('vote-cast', (data) => {
      console.log('Vote cast:', data)
      setSession(prev => ({
        ...prev,
        players: data.players,
        revealed: prev.revealed
      }))
    })

    // Handle votes revealed
    socket.on('votes-revealed', (data) => {
      console.log('Votes revealed:', data)
      setSession(prev => ({
        ...prev,
        players: data.players,
        averageScore: data.averageScore,
        revealed: data.revealed
      }))
    })

    // Handle votes reset
    socket.on('votes-reset', (data) => {
      console.log('Votes reset:', data)
      setSession(prev => ({
        ...prev,
        players: data.players,
        averageScore: data.averageScore,
        revealed: data.revealed
      }))
    })

    return () => {
      socket.off('session-state')
      socket.off('player-joined')
      socket.off('player-left')
      socket.off('story-updated')
      socket.off('vote-cast')
      socket.off('votes-revealed')
      socket.off('votes-reset')
    }
  }, [socket])

  const handleJoinSession = () => {
    if (!currentPlayerName.trim() || !sessionIdInput.trim()) return
    
    const player = {
      id: currentPlayerId,
      name: currentPlayerName,
      score: null,
      hasVoted: false
    }
    
    joinSession(sessionIdInput, player)
  }

  const handleUpdateStory = (story: string) => {
    setSession(prev => ({ ...prev, story }))
    updateStory(story)
  }

  const handleCastVote = (score: number) => {
    castVote(score)
  }

  const handleRevealVotes = () => {
    revealVotes()
  }

  const handleResetVotes = () => {
    resetVotes()
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
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copySessionId}
                  title="Copy session ID"
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
              disabled={!currentPlayerName.trim() || !sessionIdInput.trim() || !connected}
              className="w-full"
            >
              Join Session
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
                <span className="text-red-600">Disconnected</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Session: {currentSessionId}</Badge>
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
