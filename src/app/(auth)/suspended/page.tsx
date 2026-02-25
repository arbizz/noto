"use client"

import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function SuspendedPage() {
  const { data: session } = useSession()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [suspendedUntil, setSuspendedUntil] = useState<Date | null>(null)

  useEffect(() => {
    async function fetchSuspendInfo() {
      try {
        const res = await fetch("/api/users/me/status")
        if (res.ok) {
          const data = await res.json()
          if (data.suspendedUntil) {
            setSuspendedUntil(new Date(data.suspendedUntil))
          }
        }
      } catch {
        // Silent fail
      }
    }

    if (session?.user) {
      fetchSuspendInfo()
    }
  }, [session])

  useEffect(() => {
    if (!suspendedUntil) return

    function updateTimeLeft() {
      const now = new Date()
      const diff = suspendedUntil!.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft(null)
        window.location.href = "/dashboard"
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days} day${days > 1 ? "s" : ""} ${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`)
      } else if (hours > 0) {
        setTimeLeft(`${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`)
      } else {
        setTimeLeft(`${minutes} minute${minutes !== 1 ? "s" : ""}`)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000)
    return () => clearInterval(interval)
  }, [suspendedUntil])

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-yellow-500/15 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-yellow-600">Your Account Has Been Temporarily Suspended</h1>
        </div>
        <div className="space-y-3 text-muted-foreground">
          <p>
            Your account has been temporarily suspended due to a violation of our terms of service.
          </p>
          {timeLeft && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Suspension time remaining:
              </p>
              <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mt-1">
                {timeLeft}
              </p>
            </div>
          )}
          <p>
            Your account will be automatically reactivated once the suspension period ends.
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center justify-center rounded-md bg-yellow-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-yellow-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </main>
  )
}