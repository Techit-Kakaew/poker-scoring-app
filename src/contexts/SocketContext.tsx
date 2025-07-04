'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Player {
  id: string
  name: string
  score: number | null
  hasVoted: boolean
  socketId?: string
}

// PokerSession interface moved to sessionStore for consistency

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  currentSessionId: string | null
  joinSession: (sessionId: string, player: Omit<Player, 'socketId'>) => void
  updateStory: (story: string) => void
  castVote: (score: number) => void
  revealVotes: () => void
  resetVotes: () => void
  leaveSession: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  useEffect(() => {
    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3000'
    )

    socketInstance.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.close()
    }
  }, [])

  const joinSession = (sessionId: string, player: Omit<Player, 'socketId'>) => {
    if (socket) {
      setCurrentSessionId(sessionId)
      socket.emit('join-session', { sessionId, player })
    }
  }

  const updateStory = (story: string) => {
    if (socket && currentSessionId) {
      socket.emit('update-story', { sessionId: currentSessionId, story })
    }
  }

  const castVote = (score: number) => {
    if (socket && currentSessionId) {
      socket.emit('cast-vote', { sessionId: currentSessionId, score })
    }
  }

  const revealVotes = () => {
    if (socket && currentSessionId) {
      socket.emit('reveal-votes', { sessionId: currentSessionId })
    }
  }

  const resetVotes = () => {
    if (socket && currentSessionId) {
      socket.emit('reset-votes', { sessionId: currentSessionId })
    }
  }

  const leaveSession = () => {
    setCurrentSessionId(null)
    // Socket.io will handle the disconnection cleanup
  }

  const contextValue: SocketContextType = {
    socket,
    connected,
    currentSessionId,
    joinSession,
    updateStory,
    castVote,
    revealVotes,
    resetVotes,
    leaveSession
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}
