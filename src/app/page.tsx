import Link from "next/link"
import { Navbar } from "@/components/shared/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, BrainCircuit, Globe, ShieldCheck, Sparkles, Users } from "lucide-react"
import Image from "next/image"
import { categoryOptions } from "@/constants/enums"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <Navbar />
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-5xl flex-col items-center gap-4 text-center mx-auto px-4">
            <Badge variant="secondary" className="rounded-2xl px-4 py-1.5 text-sm font-medium">
              Future learning platform
            </Badge>
            <h1
              // className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Record, Learn, and <span className="text-primary">Share</span> Your Knowledge.
            </h1>
            <p className="max-w-2xl leading-normal text-muted-foreground">
              Noto helps you create structured notes and interactive flashcards.
              Join the community of learners and improve your learning score today.
            </p>
            <div className="space-x-4">
              <Link href="/register">
                <Button size="lg" className="h-11 px-8 rounded-full font-semibold">
                  Start Now
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" size="lg" className="h-11 px-8 rounded-full">
                  Explore Works
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 rounded-lg border bg-background shadow-2xl overflow-hidden w-full max-w-5xl aspect-video relative group">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-primary/5 z-0" />
              <div className="flex items-center justify-center h-full text-muted-foreground font-mono">
                <Image alt="Banner image" src="/banner.png" width={1080} height={720} />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container space-y-6 bg-slate-50/50 py-8 dark:bg-transparent md:py-12 lg:py-24 mx-auto px-4">
          <div className="mx-auto flex max-w-232 flex-col items-center space-y-4 text-center">
            <h2
              // className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl"
            >
              Key Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground">
              Designed for students and teachers. All the tools you need in one platform.
            </p>
          </div>
          
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-5xl md:grid-cols-3">
            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Rich Text Notes</CardTitle>
                <CardDescription>
                  Create neat notes with an advanced editor. Full text format support for Mathematics, Science, and more.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <BrainCircuit className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Smart Flashcards</CardTitle>
                <CardDescription>
                  Turn difficult material into interactive study cards. The best way to memorize terms and concepts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Share & Discover</CardTitle>
                <CardDescription>
                  Publish your notes to help others. Discover materials from the global community.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Reputation System</CardTitle>
                <CardDescription>
                  Earn scores and badges for quality contributions. Become a top contributor in the community.
                </CardDescription>
              </CardHeader>
            </Card>

             <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Personal Collection</CardTitle>
                <CardDescription>
                  Save your favorite materials from other users to your bookmarks for quick access anytime.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Safe Environment</CardTitle>
                <CardDescription>
                  Content is moderated with a strict reporting system to ensure accurate and safe information.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="container py-12 md:py-24 lg:py-32 mx-auto px-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Explore Categories</h2>
              <p className="text-muted-foreground font-body">Find study materials according to your interests.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-4xl">
                {categoryOptions.map((cat) => (
                  <Badge key={cat.value} variant="outline" className="text-sm py-2 px-4 cursor-default hover:bg-secondary/50 transition-colors">
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>
        </section>

        <section className="border-t bg-muted/40">
            <div className="container flex flex-col items-center gap-6 py-24 text-center mx-auto px-4">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to level up your learning?
              </h2>
              <p className="text-muted-foreground font-body max-w-150">
                Join Noto now. It's free and easy to use.
              </p>
              <Link href="/register">
                <Button size="lg" className="mt-4 px-8 py-6 text-lg rounded-full">
                  Join
                </Button>
              </Link>
            </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row mx-auto px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left font-mono">
            Built by <span className="font-bold text-foreground">Noto Team</span>. 
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}