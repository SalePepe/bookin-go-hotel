import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase"
import { AgentsDashboard } from "@/components/admin/agents-dashboard"

export const metadata: Metadata = {
  title: "Agenti MiMo | Admin | Leonardo's Rooms",
  description: "Configurazione e gestione degli agenti MiMo di Leonardo's Rooms",
}

export default async function AgentsPage() {
  const supabase = createServerSupabaseClient()

  // Verifica se l'utente è autenticato
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  // Recupera le camere
  const { data: rooms } = await supabase.from("rooms").select("id, name").order("name", { ascending: true })

  // Recupera i log degli agenti
  const { data: logs } = await supabase
    .from("mimo_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  return <AgentsDashboard initialRooms={rooms || []} initialLogs={logs || []} />
}
