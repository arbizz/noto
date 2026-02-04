export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="p-8">
        {children}
      </main>
    </>
  )
}