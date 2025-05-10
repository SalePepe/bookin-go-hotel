import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase"
import { RoomsManager } from "@/components/admin/rooms-manager"

export const metadata: Metadata = {
  title: "Gestione Camere | Admin | Leonardo's Rooms",
  description: "Gestisci le camere di Leonardo's Rooms",
}

export default async function RoomsPage() {
  const supabase = createServerSupabaseClient()

  // Verifica se l'utente è autenticato
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  // Recupera le camere
  const { data: rooms } = await supabase.from("rooms").select("*").order("base_price", { ascending: true })

  return <RoomsManager initialRooms={rooms || []} />
}
