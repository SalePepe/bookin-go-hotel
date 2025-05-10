import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Verifica l'autenticazione
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Non autorizzato" }, { status: 401 })
    }

    // Recupera i log degli agenti
    const { data, error } = await supabase
      .from("mimo_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching agent logs:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
