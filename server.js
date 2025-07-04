const { createServer } = require('http')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

// Store active sessions in memory (in production, use Redis or a database)
const sessions = new Map()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join a poker session
    socket.on('join-session', (data) => {
      const { sessionId, player } = data
      
      // Create session if it doesn't exist
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
          id: sessionId,
          story: '',
          players: new Map(),
          revealed: false,
          averageScore: null
        })
      }

      const session = sessions.get(sessionId)
      
      // Add player to session
      session.players.set(socket.id, {
        ...player,
        socketId: socket.id
      })

      // Join socket room
      socket.join(sessionId)
      
      console.log(`Player ${player.name} joined session ${sessionId}`)
      
      // Send current session state to the joining player
      socket.emit('session-state', {
        session: {
          ...session,
          players: Array.from(session.players.values())
        }
      })
      
      // Notify other players in the session
      socket.to(sessionId).emit('player-joined', {
        player: { ...player, socketId: socket.id },
        players: Array.from(session.players.values())
      })
    })

    // Update story
    socket.on('update-story', (data) => {
      const { sessionId, story } = data
      const session = sessions.get(sessionId)
      
      if (session) {
        session.story = story
        // Broadcast to all players in the session
        io.to(sessionId).emit('story-updated', { story })
      }
    })

    // Cast vote
    socket.on('cast-vote', (data) => {
      const { sessionId, playerId, score } = data
      const session = sessions.get(sessionId)
      
      if (session && session.players.has(socket.id)) {
        const player = session.players.get(socket.id)
        player.score = score
        player.hasVoted = true
        
        // Check if all players have voted
        const allVoted = Array.from(session.players.values()).every(p => p.hasVoted)
        
        // Broadcast vote status (without revealing the actual vote)
        io.to(sessionId).emit('vote-cast', {
          playerId: player.id,
          playerName: player.name,
          hasVoted: true,
          allVoted,
          players: Array.from(session.players.values()).map(p => ({
            ...p,
            score: session.revealed ? p.score : null // Only show score if revealed
          }))
        })
      }
    })

    // Reveal votes
    socket.on('reveal-votes', (data) => {
      const { sessionId } = data
      const session = sessions.get(sessionId)
      
      if (session) {
        session.revealed = true
        
        // Calculate average
        const votedPlayers = Array.from(session.players.values()).filter(p => p.hasVoted && p.score !== null)
        const average = votedPlayers.length > 0 
          ? votedPlayers.reduce((sum, p) => sum + p.score, 0) / votedPlayers.length
          : null
        
        session.averageScore = average
        
        // Broadcast revealed votes to all players
        io.to(sessionId).emit('votes-revealed', {
          players: Array.from(session.players.values()),
          averageScore: average,
          revealed: true
        })
      }
    })

    // Reset votes
    socket.on('reset-votes', (data) => {
      const { sessionId } = data
      const session = sessions.get(sessionId)
      
      if (session) {
        // Reset all player votes
        session.players.forEach(player => {
          player.score = null
          player.hasVoted = false
        })
        session.revealed = false
        session.averageScore = null
        
        // Broadcast reset to all players
        io.to(sessionId).emit('votes-reset', {
          players: Array.from(session.players.values()),
          revealed: false,
          averageScore: null
        })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      
      // Remove player from all sessions
      sessions.forEach((session, sessionId) => {
        if (session.players.has(socket.id)) {
          const player = session.players.get(socket.id)
          session.players.delete(socket.id)
          
          // Notify other players
          socket.to(sessionId).emit('player-left', {
            playerId: player.id,
            playerName: player.name,
            players: Array.from(session.players.values())
          })
          
          // Clean up empty sessions
          if (session.players.size === 0) {
            sessions.delete(sessionId)
            console.log(`Session ${sessionId} deleted (no players)`)
          }
        }
      })
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
