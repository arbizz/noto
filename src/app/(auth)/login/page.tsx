import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <>
      <main className="grid grid-cols-2 p-4 gap-4 h-screen">
        <div className="flex flex-col items-start justify-center p-12 text-justify text-primary-foreground bg-primary rounded-md">
          <h1>Noto</h1>
          <p>Organize, remember, and learn smarter. Your ideas deserve a home — and Noto makes that home beautiful.</p>
        </div>
        <div className="flex flex-col justify-center p-12 gap-8">
          <div>
            <h2>Welcome Back</h2>
            <p>Log in to continue your journey — your notes are waiting.</p>
          </div>
          <LoginForm />
        </div>
      </main>
    </>
  )
}