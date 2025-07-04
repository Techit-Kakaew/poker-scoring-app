'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Users, Eye, EyeOff, RotateCcw, Calculator } from 'lucide-react'

const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

interface Player {
  id: string
  name: string
  score: number | null
  hasVoted: boolean
}

interface PokerSession {
  id: string
  story: string
  players: Player[]
  revealed: boolean
  averageScore: number | null
}

export default function PokerScoring() {
  const [session, setSession] = useState<PokerSession>({
    id: '1',
    story: '',
    players: [],
    revealed: false,
    averageScore: null
  })
  
  const [currentPlayerName, setCurrentPlayerName] = useState('')
  const [currentPlayerId, setCurrentPlayerId] = useState('')

  useEffect(() => {
    // Generate a unique player ID if not exists
    if (!currentPlayerId) {
      setCurrentPlayerId(Math.random().toString(36).substr(2, 9))
    }
  }, [currentPlayerId])

  const addPlayer = () => {
    if (!currentPlayerName.trim()) return
    
    const newPlayer: Player = {
      id: currentPlayerId,
      name: currentPlayerName,
      score: null,
      hasVoted: false
    }
    
    setSession(prev => ({
      ...prev,
      players: [...prev.players.filter(p => p.id !== currentPlayerId), newPlayer]
    }))
    
    setCurrentPlayerName('')
  }

  const castVote = (score: number) => {
    setSession(prev => ({
      ...prev,
      players: prev.players.map(player =>
        player.id === currentPlayerId
          ? { ...player, score, hasVoted: true }
          : player
      )
    }))
  }

  const revealVotes = () => {
    const votedPlayers = session.players.filter(p => p.hasVoted && p.score !== null)
    const average = votedPlayers.length > 0 
      ? votedPlayers.reduce((sum, p) => sum + (p.score || 0), 0) / votedPlayers.length
      : null
    
    setSession(prev => ({
      ...prev,
      revealed: true,
      averageScore: average
    }))
  }

  const resetVotes = () => {
    setSession(prev => ({
      ...prev,
      players: prev.players.map(player => ({
        ...player,
        score: null,
        hasVoted: false
      })),
      revealed: false,
      averageScore: null
    }))
  }

  const currentPlayer = session.players.find(p => p.id === currentPlayerId)
  const allPlayersVoted = session.players.length > 0 && session.players.every(p => p.hasVoted)
  const votedCount = session.players.filter(p => p.hasVoted).length

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Team Poker Scoring
        </h1>
        <p className="text-gray-600">
          Use Fibonacci sequence to estimate story points collaboratively
        </p>
      </div>

      {/* Player Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="player-name">Your Name</Label>
              <Input
                id="player-name"
                value={currentPlayerName}
                onChange={(e) => setCurrentPlayerName(e.target.value)}
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addPlayer} disabled={!currentPlayerName.trim()}>
                Join
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story Input */}
      <Card>
        <CardHeader>
          <CardTitle>Story to Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={session.story}
            onChange={(e) => setSession(prev => ({ ...prev, story: e.target.value }))}
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
                  onClick={() => castVote(value)}
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
          onClick={revealVotes}
          disabled={!allPlayersVoted || session.revealed}
          size="lg"
          className="flex items-center gap-2"
        >
          <Eye className="h-5 w-5" />
          Reveal Votes
        </Button>
        
        <Button
          onClick={resetVotes}
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
