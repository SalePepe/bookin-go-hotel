import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { analyzePricing, applyPricingRecommendations } from "@/lib/agents/pricingAgent"
import { analyzeAvailability, fixAvailabilityIssues } from "@/lib/agents/availabilityAgent"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verifica l'autenticazione
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Non autorizzato" }, { status: 401 })
    }

    const body = await request.json()
    const { agent, action, params } = body

    if (!agent || !action) {
      return NextResponse.json(
        { success: false, error: "Parametri mancanti: agent e action sono obbligatori" },
        { status: 400 },
      )
    }

    let result

    // Esegui l'agente richiesto
    if (agent === "pricing") {
      if (action === "analyze") {
        result = await analyzePricing(params?.startDate, params?.endDate, params?.roomId)
      } else if (action === "apply") {
        result = await applyPricingRecommendations(params?.recommendations, params?.threshold)
      } else {
        return NextResponse.json(
          { success: false, error: `Azione non supportata per l'agente pricing: ${action}` },
          { status: 400 },
        )
      }
    } else if (agent === "availability") {
      if (action === "analyze") {
        result = await analyzeAvailability(params?.startDate, params?.endDate, params?.roomId)
      } else if (action === "fix") {
        result = await fixAvailabilityIssues(params?.alerts)
      } else {
        return NextResponse.json(
          { success: false, error: `Azione non supportata per l'agente availability: ${action}` },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json({ success: false, error: `Agente non supportato: ${agent}` }, { status: 400 })
    }

    // Registra l'esecuzione dell'agente
    await supabase.from("mimo_logs").insert({
      agent,
      action,
      details: { params, result },
      status: "completed",
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error executing agent:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
