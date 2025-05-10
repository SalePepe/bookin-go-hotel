import { createServerSupabaseClient } from "@/lib/supabase"

interface PricingFactors {
  seasonalMultiplier: number
  demandMultiplier: number
  advanceBookingDiscount: number
  lengthOfStayDiscount: number
  weekendSurcharge: number
}

export interface PricingResult {
  roomId: string
  date: string
  originalPrice: number
  adjustedPrice: number
  factors: PricingFactors
  log: string[]
}

export async function analyzePricing(startDate = "", endDate = "", roomId = ""): Promise<PricingResult[]> {
  const supabase = createServerSupabaseClient()
  const logs: string[] = []
  const results: PricingResult[] = []

  try {
    logs.push("Inizializzazione dell'agente di pricing...")

    // Se non sono specificate date, usa i prossimi 90 giorni
    if (!startDate) {
      const today = new Date()
      startDate = today.toISOString().split("T")[0]

      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + 90)
      endDate = futureDate.toISOString().split("T")[0]

      logs.push(`Nessuna data specificata. Analisi per il periodo: ${startDate} - ${endDate}`)
    }

    // Ottieni tutte le camere o una camera specifica
    const roomQuery = supabase.from("rooms").select("id, name, base_price")
    if (roomId) {
      roomQuery.eq("id", roomId)
      logs.push(`Analisi limitata alla camera con ID: ${roomId}`)
    }

    const { data: rooms, error: roomsError } = await roomQuery

    if (roomsError) {
      throw new Error(`Errore nel recupero delle camere: ${roomsError.message}`)
    }

    if (!rooms || rooms.length === 0) {
      logs.push("Nessuna camera trovata per l'analisi.")
      return [
        {
          roomId: "",
          date: "",
          originalPrice: 0,
          adjustedPrice: 0,
          factors: getDefaultFactors(),
          log: logs,
        },
      ]
    }

    logs.push(`Trovate ${rooms.length} camere per l'analisi.`)

    // Ottieni le prenotazioni esistenti per analizzare la domanda
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("room_id, check_in, check_out, created_at")
      .gte("check_in", startDate)
      .lte("check_out", endDate)

    if (bookingsError) {
      throw new Error(`Errore nel recupero delle prenotazioni: ${bookingsError.message}`)
    }

    logs.push(`Analizzate ${bookings?.length || 0} prenotazioni esistenti.`)

    // Ottieni la disponibilità esistente
    const { data: availability, error: availabilityError } = await supabase
      .from("availability")
      .select("room_id, date, price")
      .gte("date", startDate)
      .lte("date", endDate)

    if (availabilityError) {
      throw new Error(`Errore nel recupero della disponibilità: ${availabilityError.message}`)
    }

    // Per ogni camera, calcola i prezzi ottimizzati
    for (const room of rooms) {
      logs.push(`Analisi della camera: ${room.name} (ID: ${room.id})`)

      // Ottieni le date da analizzare
      const dates = getDatesInRange(new Date(startDate), new Date(endDate))

      for (const date of dates) {
        const dateString = date.toISOString().split("T")[0]

        // Trova il prezzo esistente per questa data e camera
        const existingAvailability = availability?.find((a) => a.room_id === room.id && a.date === dateString)

        const originalPrice = existingAvailability?.price || room.base_price

        // Calcola i fattori di prezzo
        const factors = calculatePricingFactors(date, room.id, bookings || [])

        // Calcola il prezzo ottimizzato
        const adjustedPrice = calculateAdjustedPrice(originalPrice, factors)

        results.push({
          roomId: room.id,
          date: dateString,
          originalPrice,
          adjustedPrice,
          factors,
          log: [...logs, `Prezzo ottimizzato per ${dateString}: ${adjustedPrice}€ (originale: ${originalPrice}€)`],
        })
      }
    }

    return results
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logs.push(`Errore durante l'analisi dei prezzi: ${errorMessage}`)

    return [
      {
        roomId: "",
        date: "",
        originalPrice: 0,
        adjustedPrice: 0,
        factors: getDefaultFactors(),
        log: logs,
      },
    ]
  }
}

export async function applyPricingRecommendations(
  recommendations: PricingResult[],
  applyThreshold = 5, // Applica solo se la differenza è maggiore del 5%
): Promise<{ success: boolean; applied: number; log: string[] }> {
  const supabase = createServerSupabaseClient()
  const logs: string[] = []
  let appliedCount = 0

  try {
    logs.push(`Applicazione delle raccomandazioni di prezzo per ${recommendations.length} date/camere...`)

    for (const rec of recommendations) {
      // Calcola la differenza percentuale
      const priceDifference = (Math.abs(rec.adjustedPrice - rec.originalPrice) / rec.originalPrice) * 100

      // Applica solo se la differenza è significativa
      if (priceDifference > applyThreshold) {
        const { error } = await supabase.from("availability").upsert({
          room_id: rec.roomId,
          date: rec.date,
          price: rec.adjustedPrice,
          is_available: true, // Assumiamo che sia disponibile
        })

        if (error) {
          logs.push(`Errore nell'aggiornamento del prezzo per ${rec.date}, camera ${rec.roomId}: ${error.message}`)
        } else {
          appliedCount++
          logs.push(
            `Prezzo aggiornato per ${rec.date}, camera ${rec.roomId}: ${rec.originalPrice}€ -> ${rec.adjustedPrice}€`,
          )
        }
      } else {
        logs.push(
          `Nessun aggiornamento necessario per ${rec.date}, camera ${rec.roomId}: differenza (${priceDifference.toFixed(2)}%) inferiore alla soglia (${applyThreshold}%)`,
        )
      }
    }

    // Registra l'esecuzione dell'agente
    await supabase.from("mimo_logs").insert({
      agent: "pricingAgent",
      action: "applyPricingRecommendations",
      details: {
        total: recommendations.length,
        applied: appliedCount,
        threshold: applyThreshold,
      },
      status: "completed",
    })

    logs.push(`Applicazione completata. Aggiornati ${appliedCount} prezzi su ${recommendations.length} analizzati.`)

    return {
      success: true,
      applied: appliedCount,
      log: logs,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logs.push(`Errore durante l'applicazione delle raccomandazioni: ${errorMessage}`)

    // Registra l'errore
    await supabase.from("mimo_logs").insert({
      agent: "pricingAgent",
      action: "applyPricingRecommendations",
      details: {
        error: errorMessage,
      },
      status: "error",
    })

    return {
      success: false,
      applied: appliedCount,
      log: logs,
    }
  }
}

// Funzioni di supporto

function getDefaultFactors(): PricingFactors {
  return {
    seasonalMultiplier: 1,
    demandMultiplier: 1,
    advanceBookingDiscount: 0,
    lengthOfStayDiscount: 0,
    weekendSurcharge: 0,
  }
}

function calculatePricingFactors(date: Date, roomId: string, bookings: any[]): PricingFactors {
  const factors = getDefaultFactors()

  // Fattore stagionale (estate e festività più costose)
  const month = date.getMonth()
  if (month >= 5 && month <= 8) {
    // Giugno-Settembre
    factors.seasonalMultiplier = 1.3 // Alta stagione estiva
  } else if (month === 11 || month === 0) {
    // Dicembre-Gennaio
    factors.seasonalMultiplier = 1.2 // Festività invernali
  } else if (month >= 3 && month <= 4) {
    // Aprile-Maggio
    factors.seasonalMultiplier = 1.15 // Primavera
  } else {
    factors.seasonalMultiplier = 0.9 // Bassa stagione
  }

  // Fattore weekend (venerdì e sabato più costosi)
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    // Venerdì e Sabato
    factors.weekendSurcharge = 0.15 // +15% nel weekend
  }

  // Fattore di domanda (più prenotazioni = prezzo più alto)
  const dateString = date.toISOString().split("T")[0]
  const bookingsForDate = bookings.filter((b) => {
    const checkIn = new Date(b.check_in)
    const checkOut = new Date(b.check_out)
    return dateString >= b.check_in && dateString < b.check_out
  })

  if (bookingsForDate.length > 3) {
    factors.demandMultiplier = 1.2 // Alta domanda
  } else if (bookingsForDate.length > 1) {
    factors.demandMultiplier = 1.1 // Media domanda
  }

  // Sconto per prenotazione anticipata
  const today = new Date()
  const daysInAdvance = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysInAdvance > 60) {
    factors.advanceBookingDiscount = 0.1 // 10% di sconto per prenotazioni con 60+ giorni di anticipo
  } else if (daysInAdvance > 30) {
    factors.advanceBookingDiscount = 0.05 // 5% di sconto per prenotazioni con 30+ giorni di anticipo
  }

  return factors
}

function calculateAdjustedPrice(basePrice: number, factors: PricingFactors): number {
  let adjustedPrice = basePrice

  // Applica i moltiplicatori
  adjustedPrice *= factors.seasonalMultiplier
  adjustedPrice *= factors.demandMultiplier

  // Applica il sovrapprezzo per il weekend
  adjustedPrice *= 1 + factors.weekendSurcharge

  // Applica lo sconto per prenotazione anticipata
  adjustedPrice *= 1 - factors.advanceBookingDiscount

  // Arrotonda a 2 decimali
  return Math.round(adjustedPrice * 100) / 100
}

function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}
