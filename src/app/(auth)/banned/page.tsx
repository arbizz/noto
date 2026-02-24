"use client"

import { signOut } from "next-auth/react"

export default function BannedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <div className="mx-auto w-16 h-16 bg-destructive/15 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-destructive">Akun Anda Telah Diblokir</h1>
                </div>
                <div className="space-y-3 text-muted-foreground">
                    <p>
                        Akun Anda telah diblokir secara <strong>permanen</strong> karena melanggar ketentuan layanan.
                    </p>
                    <p>
                        Pemblokiran ini bersifat permanen dan hanya dapat dicabut oleh administrator.
                        Jika Anda merasa ini adalah kesalahan, silakan hubungi admin melalui halaman kontak.
                    </p>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="inline-flex items-center justify-center rounded-md bg-destructive px-6 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                    Logout
                </button>
            </div>
        </main>
    )
}
