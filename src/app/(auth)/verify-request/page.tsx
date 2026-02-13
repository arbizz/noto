import { Suspense } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function VerifyRequestContent({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>
}) {
  const { email } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-6">
          
          <div className="rounded-full bg-primary/10 p-6">
            <Mail className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Check your email
            </h1>
            <p className="text-muted-foreground">
              We&apos;ve sent a magic link to
            </p>
            {email && (
              <p className="font-semibold text-foreground">
                {decodeURIComponent(email)}
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-lg border bg-card p-6 text-left w-full">
            <h2 className="font-semibold">Next steps:</h2>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the magic link in the email</li>
              <li>You&apos;ll be automatically signed in</li>
            </ol>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              The link will expire in{" "}
              <span className="font-semibold text-foreground">24 hours</span>.
            </p>
            <p>
              Didn&apos;t receive the email?{" "}
              <Link href="/login" className="font-semibold hover:underline">
                Try again
              </Link>
            </p>
          </div>

          <Button variant="outline" asChild className="w-full">
            <Link href="/login" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <VerifyRequestContent searchParams={searchParams} />
    </Suspense>
  )
}
