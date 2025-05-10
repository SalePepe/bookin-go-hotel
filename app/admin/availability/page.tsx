import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase"
import { AvailabilityManager } from "@/components/admin/availability-manager"

export const metadata: Metadata = {
  title: "Gestione Disponibilità | Admin | Leonardo's Rooms",
  description: "Gestisci la disponibilità delle camere di Leonardo's Rooms",
}

export default async function AvailabilityPage() {
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

  // Recupera le impostazioni di prenotazione
  const { data: bookingSettings } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "booking_settings")
    .single()

  return <AvailabilityManager initialRooms={rooms || []} bookingSettings={bookingSettings?.value || {}} />
}
