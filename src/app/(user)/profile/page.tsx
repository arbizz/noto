"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  LucideUser,
  LucideShieldAlert,
  LucideShieldCheck,
  LucideShieldBan,
  LucideInfo,
  LucideTrendingUp,
  LucideAlertTriangle,
  LucideBan,
  LucideTimer,
  LucideHeart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ProfileData {
  id: number
  name: string
  email: string
  image: string | null
  score: number
  status: string
  suspendedUntil: string | null
  createdAt: string
}

function getScoreColor(score: number) {
  if (score <= 15) return "bg-red-500"
  if (score <= 30) return "bg-orange-500"
  if (score <= 50) return "bg-yellow-500"
  return "bg-green-500"
}

function getStatusBadge(status: string) {
  switch (status) {
    case "banned":
      return <Badge variant="destructive" className="gap-1"><LucideShieldBan className="h-3 w-3" /> Banned</Badge>
    case "suspended":
      return <Badge variant="default" className="gap-1 bg-orange-600 hover:bg-orange-700"><LucideShieldAlert className="h-3 w-3" /> Suspended</Badge>
    default:
      return <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700"><LucideShieldCheck className="h-3 w-3" /> Active</Badge>
  }
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        const res = await fetch("/api/profile")
        if (!res.ok) throw new Error("Failed to fetch profile")
        const data = await res.json()
        setProfile(data.user)
        setName(data.user.name)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  async function handleSave() {
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Name must be at least 2 characters")
      return
    }
    if (name.trim().length > 50) {
      toast.error("Name must be at most 50 characters")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update")
      }

      const data = await res.json()
      setProfile((prev) => (prev ? { ...prev, name: data.user.name } : prev))
      toast.success("Name updated successfully!")

      // Update session so sidebar/header reflects new name
      await updateSession({ name: data.user.name })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    )
  }

  const scorePercent = Math.max(0, Math.min(100, profile.score))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and view account information</p>
      </div>

      {/* Edit Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideUser className="h-5 w-5" />
            Edit Profile
          </CardTitle>
          <CardDescription>Update your display name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">{name.trim().length}/50 characters</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || name.trim() === profile.name}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideShieldCheck className="h-5 w-5" />
            Account Score & Status
          </CardTitle>
          <CardDescription>Your current account standing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Score</p>
              <p className="text-4xl font-bold">{profile.score}<span className="text-lg text-muted-foreground">/100</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(profile.status)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreColor(profile.score)}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>Ban ≤15</span>
              <span>Suspend ≤30</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {profile.status === "suspended" && profile.suspendedUntil && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <LucideTimer className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-600 font-medium">
                Suspension ends: {new Date(profile.suspendedUntil).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideInfo className="h-5 w-5" />
            How the Scoring System Works
          </CardTitle>
          <CardDescription>Understand how your account score is managed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LucideTrendingUp className="h-4 w-4" />
              Score Levels
            </h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Score Range</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Effect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3">
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">51 – 100</Badge>
                    </td>
                    <td className="p-3 font-medium text-green-600">Active</td>
                    <td className="p-3 text-muted-foreground">Account in good standing</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">31 – 50</Badge>
                    </td>
                    <td className="p-3 font-medium text-yellow-600">Warning</td>
                    <td className="p-3 text-muted-foreground">Account active, but be cautious</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/30">16 – 30</Badge>
                    </td>
                    <td className="p-3 font-medium text-orange-600">Suspended</td>
                    <td className="p-3 text-muted-foreground">Suspended for 7 days automatically</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3">
                      <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30">0 – 15</Badge>
                    </td>
                    <td className="p-3 font-medium text-red-600">Banned</td>
                    <td className="p-3 text-muted-foreground">Account permanently blocked</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LucideAlertTriangle className="h-4 w-4" />
              Penalty Levels
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              When your content violates community guidelines, an admin may apply one of these penalties:
            </p>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Badge variant="outline">Level 1</Badge>
                <div>
                  <p className="text-sm font-medium">Minor Violation</p>
                  <p className="text-xs text-muted-foreground">−10 points</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Badge variant="outline" className="border-orange-500/50">Level 2</Badge>
                <div>
                  <p className="text-sm font-medium">Moderate Violation</p>
                  <p className="text-xs text-muted-foreground">−15 points</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Badge variant="destructive">Level 3</Badge>
                <div>
                  <p className="text-sm font-medium">Severe Violation</p>
                  <p className="text-xs text-muted-foreground">−25 points</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LucideHeart className="h-4 w-4" />
              Score Recovery
            </h3>
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 space-y-2">
              <p className="text-sm">
                Your score recovers passively over time:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>+1 point</strong> every <strong>7 days</strong> of active account usage</li>
                <li>Recovery only applies when you have no pending reports</li>
                <li>Maximum score is <strong>100</strong></li>
              </ul>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LucideBan className="h-4 w-4" />
              What Causes Score Reduction?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Publishing content that violates community guidelines</li>
              <li>Receiving reports from other users that are validated by admin</li>
              <li>Repeated violations may lead to higher penalty levels</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}