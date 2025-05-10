import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { analyzeAvailability, fixAvailabilityIssues } from "@/lib/agents/availabilityAgent"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const roomId = searchParams.get("roomId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Verifica autenticazione per accesso admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Se solo check disponibilità (per prenotazioni)
    if (searchParams.get("checkOnly") === "true") {
      const { data, error } = await supabase
        .from("availability")
        .select("room_id, date, is_available, price")
        .eq(roomId ? "room_id" : "is_available", roomId || true)
        .gte("date", startDate || new Date().toISOString().split("T")[0])
        .lte("date", endDate || "")

      if (error) {
        throw error
      }

      return NextResponse.json({ data })
    }

    // Analisi avanzata disponibilità (per admin)
    if (searchParams.get("analyze") === "true") {
      const analysis = await analyzeAvailability(startDate || "", endDate || "", roomId || "")

      return NextResponse.json(analysis)
    }

    // Ottieni tutte le camere se non è specificato roomId
    let roomsQuery = supabase.from("rooms").select("id, name")
    if (roomId) {
      roomsQuery = roomsQuery.eq("id", roomId)
    }

    const { data: rooms, error: roomsError } = await roomsQuery

    if (roomsError) {
      throw roomsError
    }

    // Se non è specificata una data di inizio, usa la data odierna
    const today = new Date().toISOString().split("T")[0]
    const queryStartDate = startDate || today

    // Se non è specificata una data di fine, usa 30 giorni dopo la data di inizio
    const defaultEndDate = new Date()
    defaultEndDate.setDate(defaultEndDate.getDate() + 30)
    const queryEndDate = endDate || defaultEndDate.toISOString().split("T")[0]

    // Fetch availability data
    const { data: availability, error: availabilityError } = await supabase
      .from("availability")
      .select("id, room_id, date, is_available, price")
      .gte("date", queryStartDate)
      .lte("date", queryEndDate)

    if (availabilityError) {
      throw availabilityError
    }

    return NextResponse.json({
      rooms,
      availability,
      period: {
        startDate: queryStartDate,
        endDate: queryEndDate,
      },
    })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Errore durante il recupero della disponibilità" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verifica autenticazione
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Gestione delle correzioni automatiche
    if (body.fixIssues && Array.isArray(body.alerts)) {
      const result = await fixAvailabilityIssues(body.alerts)
      return NextResponse.json(result)
    }

    // Batch update della disponibilità
    if (Array.isArray(body.updates)) {
      const { error } = await supabase.from("availability").upsert(body.updates)

      if (error) {
        throw error
      }

      // Registra l'azione nei logs
      await supabase.from("mimo_logs").insert({
        agent: "admin",
        action: "update_availability",
        details: {
          count: body.updates.length,
          roomIds: [...new Set(body.updates.map((u: any) => u.room_id))],
        },
        status: "completed",
      })

      return NextResponse.json({
        success: true,
        message: `Aggiornate ${body.updates.length} date con successo`,
      })
    }

    return NextResponse.json({ error: "Formato richiesta non valido" }, { status: 400 })
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json({ error: "Errore durante l'aggiornamento della disponibilità" }, { status: 500 })
  }
}
