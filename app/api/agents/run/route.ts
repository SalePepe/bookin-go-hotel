import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { analyzePricing, applyPricingRecommendations } from "@/lib/agents/pricingAgent"
import { analyzeAvailability, fixAvailabilityIssues } from "@/lib/agents/availabilityAgent"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verifica autenticazione
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 })
    }

    const body = await request.json()
    const { agent, action, params } = body

    if (!agent || !action) {
      return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 })
    }

    let result

    // Esegui l'azione dell'agente richiesto
    if (agent === "pricing") {
      if (action === "analyze") {
        result = await analyzePricing(params?.startDate, params?.endDate, params?.roomId)
      } else if (action === "apply") {
        result = await applyPricingRecommendations(params?.recommendations, params?.threshold)
      } else {
        return NextResponse.json({ error: "Azione non supportata" }, { status: 400 })
      }
    } else if (agent === "availability") {
      if (action === "analyze") {
        result = await analyzeAvailability(params?.startDate, params?.endDate, params?.roomId)
      } else if (action === "fix") {
        result = await fixAvailabilityIssues(params?.alerts)
      } else {
        return NextResponse.json({ error: "Azione non supportata" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: "Agente non supportato" }, { status: 400 })
    }

    // Registra l'esecuzione dell'agente nei log
    await supabase.from("mimo_logs").insert({
      agent,
      action,
      details: {
        params,
        success: true,
      },
      status: "completed",
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error(`Error running agent:`, error)

    // Registra l'errore
    const supabase = createServerSupabaseClient()
    await supabase.from("mimo_logs").insert({
      agent: "error",
      action: "error",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
      status: "error",
    })

    return NextResponse.json({ error: "Errore durante l'esecuzione dell'agente" }, { status: 500 })
  }
}
