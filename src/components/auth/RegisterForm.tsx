"use client"

import * as z from "zod"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { registerSchema } from "@/lib/validations/auth"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LucideEye, LucideEyeOff } from "lucide-react"

export function RegisterForm() {
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    }
  })

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Email already registered", {
            description: "Try using a different email or sign in instead"
          })
        } else if (res.status === 400) {
          toast.error("Invalid input", {
            description: "Please check your information and try again"
          })
        } else {
          toast.error("Sign up failed", {
            description: "Please try again later"
          })
        }
        setIsLoading(false)
        return
      }

      toast.success("Account created successfully!", {
        description: "Redirecting to login..."
      })
      form.reset()

      setTimeout(() => {
        router.push("/login")
      }, 1000)
    } catch (err) {
      console.error("Register error:", err)
      toast.error("An error occurred", {
        description: "Please try again later"
      })
      setIsLoading(false)
    }
  }

  return(
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <FieldGroup className="flex flex-col gap-5">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name" className="ml-1">
                  Name
                </FieldLabel>
                <div className="flex flex-col gap-1.5">
                  <Input
                    {...field}
                    id="name"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="name"
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
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email" className="ml-1">
                  Email
                </FieldLabel>
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
                <FieldLabel htmlFor="password" className="ml-1">
                  Password
                </FieldLabel>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-3">
                    <Input
                      {...field}
                      id="password"
                      type={showPass ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      autoComplete="new-password"
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
        <div className="flex flex-col gap-3 text-center">
          <small className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground hover:underline"
            >
              Sign in
            </Link>
          </small>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
        </div>
      </form>
    </>
  )
}