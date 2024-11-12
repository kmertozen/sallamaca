/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  global.io = io

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', (roomCode) => {
      socket.join(roomCode)
      console.log(`User ${socket.id} joined room: ${roomCode}`)
    })

    socket.on('leave-room', (data) => {
      socket.leave(data.roomCode);
      io.to(data.roomCode).emit('user-left', { userId: data.userId });
      console.log(`User ${data.userId} left room: ${data.roomCode}`);
    })

    socket.on('new-user', (data) => {
      io.to(data.roomCode).emit('user-joined', data)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  const PORT = process.env.PORT || 3000
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
}) 