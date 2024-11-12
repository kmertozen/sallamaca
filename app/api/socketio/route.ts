import { NextResponse } from 'next/server'
import { getSocket } from '@/lib/socket'

export async function GET(_req: Request) {
  try {
    const socket = getSocket()
    if (!socket) {
      return new NextResponse('Socket is not initialized', { status: 500 })
    }
    return new NextResponse('Socket is ready', { status: 200 })
  } catch (error) {
    console.error('Socket error:', error)
    return new NextResponse('Socket initialization failed', { status: 500 })
  }
}