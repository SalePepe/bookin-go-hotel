import type { Metadata } from "next"
import { LoginForm } from "@/components/admin/login-form"

export const metadata: Metadata = {
  title: "Login | Admin | Leonardo's Rooms",
  description: "Accedi al pannello di amministrazione di Leonardo's Rooms",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Leonardo&apos;s Rooms</h1>
          <p className="text-muted-foreground mt-2">Pannello di amministrazione</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
