import "@/styles/globals.css"
import { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import { Poppins, Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Noto",
  description: "description",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode,
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <SessionProvider>
        <body>
          {children}
          <Toaster position="top-right" />
        </body>
      </SessionProvider>
    </html>
  )
}
