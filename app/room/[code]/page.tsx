"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { initSocket } from "@/lib/socket";
import { User, FeedbackReceived } from "@prisma/client";

interface UserWithFeedback extends User {
  received: FeedbackReceived[];
}

export default function RoomPage() {
  const { code } = useParams();
  const [users, setUsers] = useState<UserWithFeedback[]>([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const socketInstance = initSocket();
    const currentUserId = localStorage.getItem("currentUserId");

    const handleBeforeUnload = async () => {
      if (currentUserId) {
        socketInstance.emit("leave-room", {
          userId: parseInt(currentUserId),
          roomCode: code,
        });
        await fetch(`/api/users/${currentUserId}`, {
          method: "DELETE",
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    socketInstance.emit("join-room", code);

    socketInstance.on("new-user", (data) => {
      console.log("New user joined:", data);
      setUsers((prev) => [...prev, data as UserWithFeedback]);
    });

    socketInstance.on("user-left", (data) => {
      console.log("user left", data);
      setUsers((prev) => prev.filter((user) => user.id !== data.userId));
    });

    socketInstance.on("feedback-received", (data) => {
      console.log("New feedback received:", data);
      setUsers((prev: UserWithFeedback[]) =>
        prev.map((user) => {
          if (user.id === data.feedback.received.toUserId) {
            return {
              ...user,
              received: [...(user.received || []), data.feedback.received],
            };
          }
          return user;
        })
      );
    });

    fetchUsers();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socketInstance.off("new-user");
      socketInstance.off("user-left");
      socketInstance.off("feedback-received");
    };
  }, [code]);
  console.log(users);
  const fetchUsers = async () => {
    const response = await fetch(`/api/users?roomCode=${code}`);
    const data = await response.json();
    setUsers(data);
  };

  const sendFeedback = async (fromUserId: number, toUserId: number) => {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: feedback,
        fromUserId,
        toUserId,
        roomCode: code,
      }),
    });

    if (response.ok) {
      setFeedback("");
      fetchUsers();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Oda: {code}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((user: UserWithFeedback) => (
          <div key={user.id} className="border p-4 rounded-lg">
            <h2 className="text-xl mb-2">{user.name}</h2>
            <textarea
              className="w-full p-2 border rounded"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Feedback yazın..."
            />
            <button
              onClick={() => sendFeedback(1, user.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Gönder
            </button>

            <div className="mt-4">
              <h3 className="font-bold">Alınan Feedbackler:</h3>
              {user.received.map((fb: FeedbackReceived) => (
                <div
                  key={fb.id}
                  className="mt-2 p-2 bg-gray-100 rounded text-black"
                >
                  {fb.content}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
