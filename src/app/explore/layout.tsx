import { Suspense } from "react"

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }>
        <main className="p-12">
          {children}
        </main>
      </Suspense>
    </>
  )
}