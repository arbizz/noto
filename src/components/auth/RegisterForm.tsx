"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { registerSchema } from "@/lib/zod/register"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

export function RegisterForm() {
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

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Register failed")
      }
      
      form.reset()
    } catch (err) {
      console.error(err)
    }
  }
  return(
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <FieldGroup className="flex flex-col gap-6">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}
                className="flex flex-col gap-2"
              >
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="john doe"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}
                className="flex flex-col gap-2"
              >
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="example@gmail.com"
                  autoCapitalize="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (    
              <Field data-invalid={fieldState.invalid}
                className="flex flex-col gap-2"
              >
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="pass"
                  autoComplete="off"
                />
              </Field>        
            )}
          />
        </FieldGroup>
        <Field>
          <Button type="submit">
            Sign up
          </Button>
        </Field>
      </form>
    </>
  )
}