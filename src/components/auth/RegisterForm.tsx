"use client"

import * as z from "zod"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { registerSchema } from "@/lib/zod"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LucideEye, LucideEyeOff } from "lucide-react"

export function RegisterForm() {
  const [showPass, setShowPass] = useState(false)
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
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Register failed")
      }

      toast.success("Account created")
      form.reset()

      router.push("/login")
    } catch (err) {
      toast.error("Sign up failed", {
        description: `${err}`
      }
      )
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
                    aria-invalid={fieldState.invalid}
                    placeholder="john doe"
                    autoComplete="off"
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
                    aria-invalid={fieldState.invalid}
                    placeholder="example@gmail.com"
                    autoCapitalize="off"
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
                      placeholder="securepass"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPass(!showPass)}
                      className="shrink-0 text-secondary-foreground"
                    >
                      {showPass ? <LucideEye /> : <LucideEyeOff />}
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
          <Button type="submit">Sign up</Button>
        </div>
      </form>
    </>
  )
}