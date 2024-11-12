import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { content, fromUserId, toUserId, roomCode } = await request.json()

    const [givenFeedback, receivedFeedback] = await Promise.all([
      prisma.feedbackGiven.create({
        data: { content, fromUserId, toUserId },
      }),
      prisma.feedbackReceived.create({
        data: { content, fromUserId, toUserId },
      })
    ])

    const io = global.io
    if (io) {
      io.to(roomCode).emit('feedback-received', {
        feedback: {
          given: givenFeedback,
          received: receivedFeedback
        }
      })
    }

    return NextResponse.json({
      given: givenFeedback,
      received: receivedFeedback,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Feedback gönderilemedi' },
      { status: 500 }
    )
  }
} 