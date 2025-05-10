import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { analyzePricing, applyPricingRecommendations } from "@/lib/agents/pricingAgent"
import { analyzeAvailability, fixAvailabilityIssues } from "@/lib/agents/availabilityAgent"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const agent = searchParams.get("agent") || "all"
    const action = searchParams.get("action") || "analyze"
    const startDate = searchParams.get("start_date") || ""
    const endDate = searchParams.get("end_date") || ""
    const roomId = searchParams.get("room_id") || ""
    const autoFix = searchParams.get("auto_fix") === "true"

    const supabase = createServerSupabaseClient()

    // Log per debugging
    console.log(
      `Esecuzione agente MiMo: agent=${agent}, action=${action}, startDate=${startDate}, endDate=${endDate}, roomId=${roomId}, autoFix=${autoFix}`,
    )

    // Risultati degli agenti
    const results: any = {}

    // Esegui l'agente di disponibilità
    if (agent === "availability" || agent === "all") {
      console.log("Esecuzione agente disponibilità...")
      const availabilityResult = await analyzeAvailability(startDate, endDate, roomId)
      results.availability = availabilityResult

      // Se richiesto, applica automaticamente le correzioni
      if (autoFix && availabilityResult.alerts && availabilityResult.alerts.length > 0) {
        console.log(`Correzione automatica di ${availabilityResult.alerts.length} problemi di disponibilità...`)
        const fixResult = await fixAvailabilityIssues(availabilityResult.alerts)
        results.availability_fix = fixResult
      }
    }

    // Esegui l'agente di pricing
    if (agent === "pricing" || agent === "all") {
      console.log("Esecuzione agente pricing...")
      const pricingResult = await analyzePricing(startDate, endDate, roomId)
      results.pricing = pricingResult

      // Se richiesto, applica automaticamente le raccomandazioni
      if (autoFix && pricingResult.recommendations && pricingResult.recommendations.length > 0) {
        console.log(`Applicazione automatica di ${pricingResult.recommendations.length} raccomandazioni di prezzo...`)
        const applyResult = await applyPricingRecommendations(pricingResult.recommendations)
        results.pricing_apply = applyResult
      }
    }

    // Registra l'esecuzione dell'agente
    await supabase.from("mimo_logs").insert({
      agent: agent,
      action: action + (autoFix ? "_with_autofix" : ""),
      details: {
        params: { startDate, endDate, roomId, autoFix },
        summary: {
          availability: results.availability
            ? {
                alerts: results.availability.alerts.length,
                fixed: results.availability_fix?.fixed || 0,
              }
            : null,
          pricing: results.pricing
            ? {
                recommendations: results.pricing.recommendations.length,
                applied: results.pricing_apply?.applied || 0,
              }
            : null,
        },
      },
      status: "completed",
    })

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Errore nell'esecuzione degli agenti MiMo:", error)

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

    return NextResponse.json({ error: "Errore durante l'esecuzione degli agenti MiMo" }, { status: 500 })
  }
}

// Endpoint POST per esecuzioni più complesse
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agent, action, params, autoFix } = body

    const supabase = createServerSupabaseClient()

    // Log per debugging
    console.log(`Esecuzione agente MiMo (POST): agent=${agent}, action=${action}`)

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

    // Registra l'esecuzione dell'agente
    await supabase.from("mimo_logs").insert({
      agent,
      action,
      details: {
        params,
        autoFix,
        success: true,
      },
      status: "completed",
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Errore nell'esecuzione degli agenti MiMo:", error)

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

    return NextResponse.json({ error: "Errore durante l'esecuzione degli agenti MiMo" }, { status: 500 })
  }
}
