import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = () => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    socket = io(socketUrl, {
      path: '/api/socketio',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  
  return socket
}

export const getSocket = () => {
  if (!socket) {
    initSocket()
  }
  return socket
}