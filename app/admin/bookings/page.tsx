import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase"
import { BookingsManager } from "@/components/admin/bookings-manager"

export const metadata: Metadata = {
  title: "Gestione Prenotazioni | Admin | Leonardo's Rooms",
  description: "Gestisci le prenotazioni di Leonardo's Rooms",
}

export default async function BookingsPage() {
  const supabase = createServerSupabaseClient()

  // Verifica se l'utente è autenticato
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  // Recupera le prenotazioni
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      room:rooms(*),
      guest:guests(*)
    `)
    .order("check_in", { ascending: false })

  return <BookingsManager initialBookings={bookings || []} />
}
