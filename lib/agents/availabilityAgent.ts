import { createServerSupabaseClient } from "@/lib/supabase"

export interface AvailabilityAlert {
  roomId: string
  roomName: string
  date: string
  issue: string
  severity: "low" | "medium" | "high"
  recommendation: string
}

export interface AvailabilityAnalysisResult {
  alerts: AvailabilityAlert[]
  stats: {
    totalDates: number
    availableDates: number
    unavailableDates: number
    lowAvailabilityPeriods: number
    unusualPatterns: number
  }
  log: string[]
}

export async function analyzeAvailability(
  startDate = "",
  endDate = "",
  roomId = "",
): Promise<AvailabilityAnalysisResult> {
  const supabase = createServerSupabaseClient()
  const logs: string[] = []
  const alerts: AvailabilityAlert[] = []

  const stats = {
    totalDates: 0,
    availableDates: 0,
    unavailableDates: 0,
    lowAvailabilityPeriods: 0,
    unusualPatterns: 0,
  }

  try {
    logs.push("Inizializzazione dell'agente di disponibilità...")

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
    const roomQuery = supabase.from("rooms").select("id, name")
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
      return { alerts: [], stats, log: logs }
    }

    logs.push(`Trovate ${rooms.length} camere per l'analisi.`)

    // Ottieni la disponibilità esistente
    const { data: availability, error: availabilityError } = await supabase
      .from("availability")
      .select("room_id, date, is_available")
      .gte("date", startDate)
      .lte("date", endDate)

    if (availabilityError) {
      throw new Error(`Errore nel recupero della disponibilità: ${availabilityError.message}`)
    }

    // Ottieni le prenotazioni esistenti
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("room_id, check_in, check_out")
      .gte("check_in", startDate)
      .lte("check_out", endDate)

    if (bookingsError) {
      throw new Error(`Errore nel recupero delle prenotazioni: ${bookingsError.message}`)
    }

    // Per ogni camera, analizza la disponibilità
    for (const room of rooms) {
      logs.push(`Analisi della camera: ${room.name} (ID: ${room.id})`)

      // Ottieni le date da analizzare
      const dates = getDatesInRange(new Date(startDate), new Date(endDate))
      stats.totalDates += dates.length

      // Prepara un array di disponibilità per questa camera
      const roomAvailability: { date: string; isAvailable: boolean }[] = dates.map((date) => {
        const dateString = date.toISOString().split("T")[0]

        // Trova la disponibilità esistente per questa data e camera
        const existingAvailability = availability?.find((a) => a.room_id === room.id && a.date === dateString)

        // Se non c'è un record di disponibilità, assumiamo che sia disponibile
        const isAvailable = existingAvailability ? existingAvailability.is_available : true

        if (isAvailable) {
          stats.availableDates++
        } else {
          stats.unavailableDates++
        }

        return { date: dateString, isAvailable }
      })

      // Analizza periodi di bassa disponibilità
      analyzeLowAvailabilityPeriods(roomAvailability, room, alerts, stats, logs)

      // Analizza pattern inusuali
      analyzeUnusualPatterns(roomAvailability, room, alerts, stats, logs)

      // Verifica incongruenze tra disponibilità e prenotazioni
      if (bookings && bookings.length > 0) {
        analyzeBookingInconsistencies(roomAvailability, bookings, room, alerts, logs)
      }
    }

    // Registra l'esecuzione dell'agente
    await supabase.from("mimo_logs").insert({
      agent: "availabilityAgent",
      action: "analyzeAvailability",
      details: {
        period: `${startDate} - ${endDate}`,
        roomId: roomId || "all",
        stats,
      },
      status: "completed",
    })

    logs.push(`Analisi completata. Trovati ${alerts.length} avvisi.`)

    return {
      alerts,
      stats,
      log: logs,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logs.push(`Errore durante l'analisi della disponibilità: ${errorMessage}`)

    // Registra l'errore
    await supabase.from("mimo_logs").insert({
      agent: "availabilityAgent",
      action: "analyzeAvailability",
      details: {
        error: errorMessage,
      },
      status: "error",
    })

    return {
      alerts: [],
      stats,
      log: logs,
    }
  }
}

export async function fixAvailabilityIssues(
  alerts: AvailabilityAlert[],
): Promise<{ success: boolean; fixed: number; log: string[] }> {
  const supabase = createServerSupabaseClient()
  const logs: string[] = []
  let fixedCount = 0

  try {
    logs.push(`Correzione di ${alerts.length} problemi di disponibilità...`)

    for (const alert of alerts) {
      // Implementa la correzione in base al tipo di problema
      if (alert.issue.includes("prenotazione esistente")) {
        // Imposta la disponibilità a false se c'è una prenotazione
        const { error } = await supabase.from("availability").upsert({
          room_id: alert.roomId,
          date: alert.date,
          is_available: false,
        })

        if (error) {
          logs.push(`Errore nella correzione per ${alert.date}, camera ${alert.roomName}: ${error.message}`)
        } else {
          fixedCount++
          logs.push(
            `Corretta disponibilità per ${alert.date}, camera ${alert.roomName}: impostata come non disponibile`,
          )
        }
      } else if (alert.issue.includes("bloccata senza prenotazioni")) {
        // Imposta la disponibilità a true se non ci sono prenotazioni
        const { error } = await supabase.from("availability").upsert({
          room_id: alert.roomId,
          date: alert.date,
          is_available: true,
        })

        if (error) {
          logs.push(`Errore nella correzione per ${alert.date}, camera ${alert.roomName}: ${error.message}`)
        } else {
          fixedCount++
          logs.push(`Corretta disponibilità per ${alert.date}, camera ${alert.roomName}: impostata come disponibile`)
        }
      }
      // Altri tipi di correzioni possono essere implementati qui
    }

    // Registra l'esecuzione dell'agente
    await supabase.from("mimo_logs").insert({
      agent: "availabilityAgent",
      action: "fixAvailabilityIssues",
      details: {
        total: alerts.length,
        fixed: fixedCount,
      },
      status: "completed",
    })

    logs.push(`Correzione completata. Risolti ${fixedCount} problemi su ${alerts.length}.`)

    return {
      success: true,
      fixed: fixedCount,
      log: logs,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logs.push(`Errore durante la correzione dei problemi: ${errorMessage}`)

    // Registra l'errore
    await supabase.from("mimo_logs").insert({
      agent: "availabilityAgent",
      action: "fixAvailabilityIssues",
      details: {
        error: errorMessage,
      },
      status: "error",
    })

    return {
      success: false,
      fixed: fixedCount,
      log: logs,
    }
  }
}

// Funzioni di supporto

function analyzeLowAvailabilityPeriods(
  availability: { date: string; isAvailable: boolean }[],
  room: { id: string; name: string },
  alerts: AvailabilityAlert[],
  stats: any,
  logs: string[],
) {
  // Cerca periodi con poca disponibilità (3 o più giorni consecutivi non disponibili)
  let consecutiveUnavailable = 0
  let periodStart = ""

  for (let i = 0; i < availability.length; i++) {
    if (!availability[i].isAvailable) {
      if (consecutiveUnavailable === 0) {
        periodStart = availability[i].date
      }
      consecutiveUnavailable++
    } else {
      if (consecutiveUnavailable >= 3) {
        stats.lowAvailabilityPeriods++

        const periodEnd = availability[i - 1].date
        logs.push(
          `Trovato periodo di bassa disponibilità: ${periodStart} - ${periodEnd} (${consecutiveUnavailable} giorni)`,
        )

        alerts.push({
          roomId: room.id,
          roomName: room.name,
          date: periodStart,
          issue: `Periodo di ${consecutiveUnavailable} giorni consecutivi non disponibili`,
          severity: consecutiveUnavailable > 7 ? "high" : "medium",
          recommendation: "Verificare se questo blocco è intenzionale o se può essere reso disponibile",
        })
      }
      consecutiveUnavailable = 0
    }
  }

  // Controlla anche l'ultimo periodo se arriva fino alla fine
  if (consecutiveUnavailable >= 3) {
    stats.lowAvailabilityPeriods++

    const periodEnd = availability[availability.length - 1].date
    logs.push(
      `Trovato periodo di bassa disponibilità: ${periodStart} - ${periodEnd} (${consecutiveUnavailable} giorni)`,
    )

    alerts.push({
      roomId: room.id,
      roomName: room.name,
      date: periodStart,
      issue: `Periodo di ${consecutiveUnavailable} giorni consecutivi non disponibili`,
      severity: consecutiveUnavailable > 7 ? "high" : "medium",
      recommendation: "Verificare se questo blocco è intenzionale o se può essere reso disponibile",
    })
  }
}

function analyzeUnusualPatterns(
  availability: { date: string; isAvailable: boolean }[],
  room: { id: string; name: string },
  alerts: AvailabilityAlert[],
  stats: any,
  logs: string[],
) {
  // Cerca pattern inusuali come giorni isolati non disponibili
  for (let i = 1; i < availability.length - 1; i++) {
    if (!availability[i].isAvailable && availability[i - 1].isAvailable && availability[i + 1].isAvailable) {
      stats.unusualPatterns++
      logs.push(`Trovato pattern inusuale: giorno isolato non disponibile il ${availability[i].date}`)

      alerts.push({
        roomId: room.id,
        roomName: room.name,
        date: availability[i].date,
        issue: "Giorno isolato non disponibile tra giorni disponibili",
        severity: "low",
        recommendation: "Verificare se questo blocco è intenzionale o se può essere reso disponibile",
      })
    }
  }

  // Cerca pattern a scacchiera (alternanza di disponibile/non disponibile)
  let alternatingCount = 0
  for (let i = 1; i < availability.length; i++) {
    if (availability[i].isAvailable !== availability[i - 1].isAvailable) {
      alternatingCount++
    }
  }

  // Se più del 40% dei giorni alterna disponibilità, potrebbe essere un pattern inusuale
  if (alternatingCount > availability.length * 0.4) {
    stats.unusualPatterns++
    logs.push(`Trovato pattern inusuale: alternanza frequente di disponibilità/non disponibilità`)

    alerts.push({
      roomId: room.id,
      roomName: room.name,
      date: availability[0].date,
      issue: "Pattern a scacchiera di disponibilità/non disponibilità",
      severity: "medium",
      recommendation: "Verificare se questo pattern è intenzionale o se può essere ottimizzato",
    })
  }
}

function analyzeBookingInconsistencies(
  availability: { date: string; isAvailable: boolean }[],
  bookings: any[],
  room: { id: string; name: string },
  alerts: AvailabilityAlert[],
  logs: string[],
) {
  // Verifica incongruenze tra disponibilità e prenotazioni
  for (const item of availability) {
    const date = item.date

    // Cerca prenotazioni per questa data e camera
    const hasBooking = bookings.some(
      (booking) => booking.room_id === room.id && date >= booking.check_in && date < booking.check_out,
    )

    // Se c'è una prenotazione ma la camera risulta disponibile
    if (hasBooking && item.isAvailable) {
      logs.push(`Incongruenza trovata: ${date} ha una prenotazione ma risulta disponibile`)

      alerts.push({
        roomId: room.id,
        roomName: room.name,
        date,
        issue: "Camera disponibile nonostante una prenotazione esistente",
        severity: "high",
        recommendation: "Impostare la disponibilità a 'non disponibile' per questa data",
      })
    }

    // Se non ci sono prenotazioni ma la camera risulta non disponibile
    if (!hasBooking && !item.isAvailable) {
      logs.push(`Possibile blocco non necessario: ${date} non ha prenotazioni ma risulta non disponibile`)

      alerts.push({
        roomId: room.id,
        roomName: room.name,
        date,
        issue: "Camera bloccata senza prenotazioni",
        severity: "medium",
        recommendation: "Verificare se questo blocco è intenzionale o se può essere reso disponibile",
      })
    }
  }
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
