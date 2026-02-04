import Link from "next/link"
import { Navbar } from "@/components/shared/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, BrainCircuit, Globe, ShieldCheck, Sparkles, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Navbar />
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto px-4">
            <Badge variant="secondary" className="rounded-2xl px-4 py-1.5 text-sm font-medium">
              🚀 Platform Belajar Masa Depan
            </Badge>
            <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Catat, Pelajari, dan <span className="text-primary">Bagikan</span> Pengetahuanmu.
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 font-body">
              Noto membantu kamu membuat catatan terstruktur dan flashcard interaktif. 
              Bergabunglah dengan komunitas pembelajar dan tingkatkan skor belajarmu hari ini.
            </p>
            <div className="space-x-4">
              <Link href="/register">
                <Button size="lg" className="h-11 px-8 rounded-full font-semibold">
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="/discover">
                <Button variant="outline" size="lg" className="h-11 px-8 rounded-full">
                  Jelajahi Karya
                </Button>
              </Link>
            </div>
            
            {/* Mockup / Visual Placeholder */}
            <div className="mt-16 rounded-lg border bg-background shadow-2xl overflow-hidden w-full max-w-5xl aspect-video relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 z-0" />
              <div className="flex items-center justify-center h-full text-muted-foreground font-mono">
                {/* Anda bisa mengganti ini dengan screenshot aplikasi dashboard nanti */}
                [Dashboard Application Preview Image]
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION (Based on Use Cases) */}
        <section id="features" className="container space-y-6 bg-slate-50/50 py-8 dark:bg-transparent md:py-12 lg:py-24 mx-auto px-4">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Fitur Unggulan
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7 font-body">
              Didesain untuk siswa dan pengajar. Semua alat yang Anda butuhkan dalam satu platform.
            </p>
          </div>
          
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {/* Feature 1: Notes (Membuat Catatan) */}
            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Rich Text Notes</CardTitle>
                <CardDescription>
                  Buat catatan yang rapi dengan editor canggih. Dukungan format teks lengkap untuk Matematika, Sains, dan lainnya.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2: Flashcards (Membuat Flashcard) */}
            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <BrainCircuit className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Smart Flashcards</CardTitle>
                <CardDescription>
                  Ubah materi sulit menjadi kartu belajar interaktif. Cara terbaik untuk menghafal istilah dan konsep.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: Community (Membagi ke Publik) */}
            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Bagikan & Temukan</CardTitle>
                <CardDescription>
                  Publikasikan catatanmu untuk membantu orang lain. Temukan materi dari komunitas global.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: Gamification (Score & Likes) */}
            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Sistem Reputasi</CardTitle>
                <CardDescription>
                  Dapatkan skor dan lencana untuk kontribusi berkualitas. Jadilah top contributor di komunitas.
                </CardDescription>
              </CardHeader>
            </Card>

             {/* Feature 5: Bookmark (Bookmark Catatan) */}
             <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Koleksi Pribadi</CardTitle>
                <CardDescription>
                  Simpan materi favorit dari pengguna lain ke dalam bookmark Anda untuk akses cepat kapan saja.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6: Moderation (Pelaporan) */}
            <Card className="flex flex-col justify-between border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="font-heading">Lingkungan Aman</CardTitle>
                <CardDescription>
                  Konten dimoderasi dengan sistem pelaporan yang ketat untuk memastikan informasi yang akurat dan aman.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CATEGORIES SECTION (Based on Enums) */}
        <section className="container py-12 md:py-24 lg:py-32 mx-auto px-4">
           <div className="flex flex-col items-center gap-4 text-center">
             <h2 className="font-heading text-3xl font-bold md:text-4xl">Jelajahi Kategori</h2>
             <p className="text-muted-foreground font-body">Temukan materi pelajaran sesuai minatmu.</p>
             <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-4xl">
               {["Mathematics", "Science", "Computer Science", "Business Economics", "Language", "Engineering", "Arts & Humanities"].map((cat) => (
                 <Badge key={cat} variant="outline" className="text-sm py-2 px-4 cursor-default hover:bg-secondary/50 transition-colors">
                   {cat}
                 </Badge>
               ))}
             </div>
           </div>
        </section>

        {/* CTA SECTION */}
        <section className="border-t bg-muted/40">
           <div className="container flex flex-col items-center gap-6 py-24 text-center mx-auto px-4">
             <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
               Siap untuk meningkatkan cara belajarmu?
             </h2>
             <p className="text-muted-foreground font-body max-w-[600px]">
               Bergabunglah dengan Noto sekarang. Gratis dan mudah digunakan.
             </p>
             <Link href="/register">
               <Button size="lg" className="mt-4 px-8 py-6 text-lg rounded-full">
                 Buat Akun Gratis
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