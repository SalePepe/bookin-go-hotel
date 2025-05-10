import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ContentManager } from "@/components/admin/content-manager"

export const metadata: Metadata = {
  title: "Gestione Contenuti | Admin | Leonardo's Rooms",
  description: "Gestisci i contenuti del sito di Leonardo's Rooms",
}

export default async function ContentPage() {
  const supabase = createServerSupabaseClient()

  // Verifica se l'utente è autenticato
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/admin/login")
  }

  // Recupera i contenuti
  const { data: content } = await supabase.from("content").select("*").order("section", { ascending: true })

  return <ContentManager initialContent={content || []} />
}
