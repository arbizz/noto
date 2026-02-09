"use client"

import * as z from "zod"
import Link from "next/link"
import { loginSchema } from "@/lib/validations/auth"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { LucideEye, LucideEyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"

export function LoginForm() {
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    }
  })

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    
    try {
      const res = await signIn("credentials", {
        ...data,
        redirect: false
      })
    
      if (res?.error) {
        toast.error("Invalid credentials", {
          description: "Check your email and password"
        })
        setIsLoading(false)
        return
      }

      toast.success("Sign in success")
      router.push("/dashboard")
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again"
      })
      console.error(error)
      setIsLoading(false)
    }
  }

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <FieldGroup className="flex flex-col gap-5">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email" className="ml-1">Email</FieldLabel>
                <div className="flex flex-col gap-1.5">
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="example@gmail.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} className="ml-1" />
                  )}
                </div>
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password" className="ml-1">Password</FieldLabel>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-3">
                    <Input
                      {...field}
                      id="password"
                      type={showPass ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPass(!showPass)}
                      className="shrink-0 text-secondary-foreground"
                      disabled={isLoading}
                    >
                      {showPass ? <LucideEye size={20} /> : <LucideEyeOff size={20} />}
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} className="ml-1" />
                  )}
                </div>
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex flex-col gap-4 text-center">
          <small className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-foreground hover:underline">
              Create one
            </Link>
          </small>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-border" />
            <small className="text-muted-foreground">or</small>
            <span className="flex-1 h-px bg-border" />
          </div>
          <Button 
            type="button"
            variant="outline"
            onClick={() => signIn("google")}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <FcGoogle />
            Sign in with Google
          </Button>
        </div>
      </form>
    </>
  )
}