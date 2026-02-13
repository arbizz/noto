"use client"

import * as z from "zod"
import { magicLinkSchema } from "@/lib/validations/auth"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"
import { Mail } from "lucide-react"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    }
  })

  async function onSubmit(data: z.infer<typeof magicLinkSchema>) {
    setIsLoading(true)
    
    try {
      const res = await signIn("resend", {
        email: data.email,
        redirect: false,
        callbackUrl: "/dashboard"
      })
    
      if (res?.error) {
        toast.error("Failed to send magic link", {
          description: "Please try again"
        })
        setIsLoading(false)
        return
      }

      router.push(`/verify-request?email=${encodeURIComponent(data.email)}`)
      
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again"
      })
      console.error(error)
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    try {
      await signIn("google", {
        callbackUrl: "/dashboard"
      })
    } catch (error) {
      toast.error("Failed to sign in with Google")
      console.error(error)
      setIsGoogleLoading(false)
    }
  }

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FieldGroup>
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
        </FieldGroup>
        
        <div className="flex flex-col gap-4 text-center">
          <Button 
            type="submit" 
            disabled={isLoading || isGoogleLoading}
            className="flex items-center gap-2"
          >
            <Mail size={18} />
            {isLoading ? "Sending magic link..." : "Sign in with Email"}
          </Button>
          
          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-border" />
            <small className="text-muted-foreground">or</small>
            <span className="flex-1 h-px bg-border" />
          </div>
          
          <Button 
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="flex items-center gap-2"
            disabled={isLoading || isGoogleLoading}
          >
            <FcGoogle />
            {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </div>
      </form>
    </>
  )
}