import { RegisterForm } from "@/components/auth/RegisterForm";

export default function  RegisterPage() {
  return (
    <>
      <main className="grid grid-cols-2 p-4 gap-4 h-screen">
        <div className="flex flex-col items-start justify-center p-12 text-justify text-primary-foreground bg-primary rounded-md">
          <h1>Noto</h1>
          <p>Organize, remember, and learn smarter. Your ideas deserve a home — and Noto makes that home beautiful.</p>
        </div>
        <div className="flex flex-col justify-center p-12 gap-8">
          <div>
            <h2>Create an account</h2>
            <p>Join Noto — your smarter workspace for notes, flashcards, and learning.</p>
          </div>
          <RegisterForm />
        </div>
      </main>
    </>
  )
}