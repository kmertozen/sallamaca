'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        roomCode,
      }),
    })
    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('currentUserId', data.id.toString())
      router.push(`/room/${roomCode}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleJoin} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="İsminiz"
          className="block w-full p-2 border rounded"
        />
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Oda Kodu"
          className="block w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Odaya Katıl
        </button>
      </form>
    </div>
  )
}
