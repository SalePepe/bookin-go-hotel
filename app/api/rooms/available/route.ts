import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { calculateNights } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const checkIn = searchParams.get("check_in")
    const checkOut = searchParams.get("check_out")
    const adults = Number.parseInt(searchParams.get("adults") || "2")
    const children = Number.parseInt(searchParams.get("children") || "0")
    const roomId = searchParams.get("room_id")
    const includePartial = searchParams.get("include_partial") === "true"

    // Validazione parametri
    if (!checkIn || !checkOut) {
      return NextResponse.json({ error: "I parametri check_in e check_out sono obbligatori" }, { status: 400 })
    }

    // Validazione formato date
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: "Formato date non valido. Utilizzare YYYY-MM-DD" }, { status: 400 })
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: "La data di check-out deve essere successiva alla data di check-in" },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Log per debugging
    console.log(
      `Ricerca disponibilità: check_in=${checkIn}, check_out=${checkOut}, adults=${adults}, children=${children}`,
    )

    // 1. Ottieni tutte le camere attive
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .eq("is_active", true)
      .order("base_price", { ascending: true })

    if (roomsError) {
      console.error("Errore nel recupero delle camere:", roomsError)
      return NextResponse.json({ error: "Errore nel recupero delle camere" }, { status: 500 })
    }

    if (!rooms || rooms.length === 0) {
      console.log("Nessuna camera trovata nel database")
      return NextResponse.json({ rooms: [], message: "Nessuna camera trovata" })
    }

    console.log(`Trovate ${rooms.length} camere attive`)

    // 2. Ottieni tutte le date nel periodo richiesto
    const dates = getDatesInRange(checkInDate, checkOutDate)
    const dateStrings = dates.map((date) => date.toISOString().split("T")[0])

    console.log(`Periodo richiesto: ${dateStrings.length} giorni`)

    // 3. Ottieni la disponibilità per il periodo richiesto
    const { data: availability, error: availabilityError } = await supabase
      .from("availability")
      .select("*")
      .in(
        "room_id",
        rooms.map((room) => room.id),
      )
      .gte("date", dateStrings[0])
      .lt("date", dateStrings[dateStrings.length - 1])

    if (availabilityError) {
      console.error("Errore nel recupero della disponibilità:", availabilityError)
      return NextResponse.json({ error: "Errore nel recupero della disponibilità" }, { status: 500 })
    }

    console.log(`Trovati ${availability?.length || 0} record di disponibilità`)

    // 4. Ottieni le prenotazioni esistenti per il periodo
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .in(
        "room_id",
        rooms.map((room) => room.id),
      )
      .or(`check_in.lte.${dateStrings[dateStrings.length - 1]},check_out.gt.${dateStrings[0]}`)
      .not("status", "eq", "cancelled")

    if (bookingsError) {
      console.error("Errore nel recupero delle prenotazioni:", bookingsError)
      return NextResponse.json({ error: "Errore nel recupero delle prenotazioni" }, { status: 500 })
    }

    console.log(`Trovate ${bookings?.length || 0} prenotazioni nel periodo`)

    // 5. Filtra le camere in base alla disponibilità e al numero di ospiti
    const totalGuests = adults + children

    // Prepara i risultati con disponibilità completa e parziale
    const fullyAvailableRooms = []
    const partiallyAvailableRooms = []
    const unavailableRooms = []

    // Calcola il numero di notti
    const nights = calculateNights(checkInDate, checkOutDate)

    for (const room of rooms) {
      // Verifica se la camera può ospitare tutti gli ospiti
      if (room.max_guests < totalGuests) {
        console.log(
          `Camera ${room.id} (${room.name}) non ha capacità sufficiente (${room.max_guests} < ${totalGuests})`,
        )
        unavailableRooms.push({
          ...room,
          availability_status: "unavailable",
          reason: "capacity",
          available_dates: [],
          unavailable_dates: [],
          total_price: room.base_price * nights,
        })
        continue
      }

      // Controlla la disponibilità per ogni data
      const unavailableDates = []
      const availableDates = []

      for (const dateStr of dateStrings) {
        // Cerca record di disponibilità specifico
        const availabilityRecord = availability?.find((a) => a.room_id === room.id && a.date === dateStr)

        // Cerca prenotazioni per questa data
        const hasBooking = bookings?.some(
          (b) =>
            b.room_id === room.id &&
            new Date(dateStr) >= new Date(b.check_in) &&
            new Date(dateStr) < new Date(b.check_out),
        )

        // Se c'è un record di disponibilità e non è disponibile, o se c'è una prenotazione
        if ((availabilityRecord && !availabilityRecord.is_available) || hasBooking) {
          unavailableDates.push(dateStr)
        } else {
          availableDates.push(dateStr)
        }
      }

      // Calcola il prezzo totale
      const roomPrices =
        availability
          ?.filter((a) => a.room_id === room.id && availableDates.includes(a.date))
          .map((a) => a.price || room.base_price) || []

      const totalPrice =
        roomPrices.length > 0 ? roomPrices.reduce((sum, price) => sum + price, 0) : room.base_price * nights

      // Classifica la camera in base alla disponibilità
      if (unavailableDates.length === 0) {
        console.log(`Camera ${room.id} (${room.name}) completamente disponibile`)
        fullyAvailableRooms.push({
          ...room,
          availability_status: "fully_available",
          available_dates: availableDates,
          unavailable_dates: [],
          total_price: totalPrice,
        })
      } else if (availableDates.length > 0) {
        console.log(
          `Camera ${room.id} (${room.name}) parzialmente disponibile: ${availableDates.length}/${dateStrings.length} giorni`,
        )
        partiallyAvailableRooms.push({
          ...room,
          availability_status: "partially_available",
          available_dates: availableDates,
          unavailable_dates: unavailableDates,
          total_price: totalPrice,
          availability_percentage: Math.round((availableDates.length / dateStrings.length) * 100),
        })
      } else {
        console.log(`Camera ${room.id} (${room.name}) non disponibile`)
        unavailableRooms.push({
          ...room,
          availability_status: "unavailable",
          reason: "dates",
          available_dates: [],
          unavailable_dates: unavailableDates,
          total_price: totalPrice,
        })
      }
    }

    // Se è richiesta una camera specifica, filtra solo quella
    if (roomId) {
      const specificRoom = [...fullyAvailableRooms, ...partiallyAvailableRooms, ...unavailableRooms].find(
        (room) => room.id === roomId,
      )

      return NextResponse.json({
        room: specificRoom || null,
        availability_status: specificRoom?.availability_status || "not_found",
      })
    }

    // Prepara la risposta
    const response = {
      fully_available: fullyAvailableRooms,
      partially_available: partiallyAvailableRooms,
      unavailable: unavailableRooms,
      summary: {
        total_rooms: rooms.length,
        fully_available: fullyAvailableRooms.length,
        partially_available: partiallyAvailableRooms.length,
        unavailable: unavailableRooms.length,
      },
    }

    // Se non ci sono camere completamente disponibili ma ci sono parzialmente disponibili
    if (fullyAvailableRooms.length === 0 && partiallyAvailableRooms.length > 0) {
      console.log("Nessuna camera completamente disponibile, ma ci sono opzioni parziali")

      // Ordina per percentuale di disponibilità (decrescente)
      partiallyAvailableRooms.sort((a, b) => (b.availability_percentage || 0) - (a.availability_percentage || 0))

      response.recommendations = {
        message: "Nessuna camera completamente disponibile per il periodo selezionato",
        best_alternatives: partiallyAvailableRooms.slice(0, 3),
        suggestion: "Prova a modificare le date o contattaci per soluzioni personalizzate",
      }
    } else if (fullyAvailableRooms.length === 0 && partiallyAvailableRooms.length === 0) {
      console.log("Nessuna camera disponibile per il periodo selezionato")
      response.recommendations = {
        message: "Nessuna camera disponibile per il periodo selezionato",
        suggestion: "Prova a modificare le date o contattaci per soluzioni personalizzate",
      }
    }

    // Restituisci solo le camere completamente disponibili o includi anche quelle parziali
    return NextResponse.json(
      includePartial
        ? response
        : {
            rooms: fullyAvailableRooms,
            summary: response.summary,
            recommendations: response.recommendations,
          },
    )
  } catch (error) {
    console.error("Errore nella ricerca delle camere disponibili:", error)
    return NextResponse.json({ error: "Errore durante la ricerca delle camere disponibili" }, { status: 500 })
  }
}

// Funzione di supporto per ottenere tutte le date in un intervallo
function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates = []
  const currentDate = new Date(startDate)

  // Escludi l'ultimo giorno (check-out)
  while (currentDate < endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}
