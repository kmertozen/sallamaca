import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, roomCode } = await request.json()
    
    const user = await prisma.user.create({
      data: {
        name,
        roomCode,
      },
    })

    const io = global.io
    if (io) {
        console.log(user)
      io.to(roomCode).emit('new-user', { 
        ...user,
        feedbacks: [],
        received: [],
       })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulamadı' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('roomCode')

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Oda kodu gerekli' },
        { status: 400 }
      )
    }

    const users = await prisma.user.findMany({
      where: {
        roomCode,
      },
      include: {
        feedbacks: true,
        received: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    )
  }
} 