import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase"
import { AdminDashboard } from "@/components/admin/dashboard"

export const metadata: Metadata = {
  title: "Dashboard | Admin | Leonardo's Rooms",
  description: "Pannello di amministrazione di Leonardo's Rooms",
}

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()

  // Verifica se l'utente è autenticato
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  return <AdminDashboard />
}
