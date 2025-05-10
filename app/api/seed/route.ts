import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Seed rooms
    const rooms = [
      {
        name: "Camera Doppia Standard",
        short_description: "Confortevole camera doppia con bagno privato",
        description:
          "La nostra Camera Doppia Standard offre tutto il comfort necessario per un soggiorno piacevole. Dotata di letto matrimoniale, bagno privato con doccia, aria condizionata, TV a schermo piatto e Wi-Fi gratuito.",
        base_price: 80,
        max_guests: 2,
        size_sqm: 18,
        beds: "Matrimoniale",
        amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli"],
        images: ["/placeholder.svg?height=600&width=800"],
        is_active: true,
      },
      {
        name: "Camera Tripla",
        short_description: "Spaziosa camera per tre persone con vista giardino",
        description:
          "La nostra Camera Tripla è perfetta per famiglie o piccoli gruppi. Dotata di un letto matrimoniale e un letto singolo, bagno privato con doccia, aria condizionata, TV a schermo piatto e Wi-Fi gratuito. Dalla finestra si gode una piacevole vista sul giardino.",
        base_price: 110,
        max_guests: 3,
        size_sqm: 22,
        beds: "Matrimoniale + Singolo",
        amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli", "Vista giardino"],
        images: ["/placeholder.svg?height=600&width=800"],
        is_active: true,
      },
      {
        name: "Camera Matrimoniale Superior",
        short_description: "Elegante camera con balcone privato",
        description:
          "La nostra Camera Matrimoniale Superior offre un'esperienza di soggiorno di livello superiore. Dotata di letto matrimoniale, bagno privato con doccia, aria condizionata, TV a schermo piatto, Wi-Fi gratuito e un balcone privato dove rilassarsi e godere della vista.",
        base_price: 95,
        max_guests: 2,
        size_sqm: 20,
        beds: "Matrimoniale",
        amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli", "Balcone"],
        images: ["/placeholder.svg?height=600&width=800"],
        is_active: true,
      },
      {
        name: "Camera Singola",
        short_description: "Accogliente camera singola per viaggiatori solitari",
        description:
          "La nostra Camera Singola è l'ideale per chi viaggia da solo. Compatta ma confortevole, è dotata di letto singolo, bagno privato con doccia, aria condizionata, TV a schermo piatto e Wi-Fi gratuito.",
        base_price: 60,
        max_guests: 1,
        size_sqm: 14,
        beds: "Singolo",
        amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli"],
        images: ["/placeholder.svg?height=600&width=800"],
        is_active: true,
      },
      {
        name: "Suite Familiare",
        short_description: "Ampia suite ideale per famiglie fino a 4 persone",
        description:
          "La nostra Suite Familiare è la soluzione perfetta per famiglie. Spaziosa e confortevole, è dotata di una camera con letto matrimoniale e una camera con due letti singoli, bagno privato con doccia, aria condizionata, TV a schermo piatto e Wi-Fi gratuito.",
        base_price: 140,
        max_guests: 4,
        size_sqm: 30,
        beds: "Matrimoniale + 2 Singoli",
        amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli", "Due camere separate"],
        images: ["/placeholder.svg?height=600&width=800"],
        is_active: true,
      },
      {
        name: "Camera Doppia Economy",
        short_description: "Camera doppia essenziale a prezzo conveniente",
        description:
          "La nostra Camera Doppia Economy offre tutti i servizi essenziali a un prezzo conveniente. Dotata di letto matrimoniale, bagno privato con doccia, aria condizionata, TV e Wi-Fi gratuito.",
        base_price: 70,
        max_guests: 2,
        size_sqm: 16,
        beds: "Matrimoniale",
        amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato"],
        images: ["/placeholder.svg?height=600&width=800"],
        is_active: true,
      },
    ]

    // Seed services
    const services = [
      {
        name_it: "Wi-Fi Gratuito",
        name_en: "Free Wi-Fi",
        description_it:
          "Connessione Wi-Fi ad alta velocità disponibile in tutta la struttura, per rimanere sempre connessi durante il vostro soggiorno.",
        description_en:
          "High-speed Wi-Fi connection available throughout the property, to stay connected during your stay.",
        icon: "wifi",
        is_active: true,
      },
      {
        name_it: "Colazione Inclusa",
        name_en: "Breakfast Included",
        description_it:
          "Colazione continentale inclusa con prodotti locali e fatti in casa, servita ogni mattina nella sala colazione.",
        description_en:
          "Continental breakfast included with local and homemade products, served every morning in the breakfast room.",
        icon: "utensils",
        is_active: true,
      },
      {
        name_it: "Parcheggio Gratuito",
        name_en: "Free Parking",
        description_it:
          "Parcheggio gratuito disponibile per tutti gli ospiti, per la massima comodità durante il vostro soggiorno.",
        description_en: "Free parking available for all guests, for maximum convenience during your stay.",
        icon: "car",
        is_active: true,
      },
      {
        name_it: "Aria Condizionata",
        name_en: "Air Conditioning",
        description_it:
          "Tutte le camere sono dotate di aria condizionata, per garantire il massimo comfort in ogni stagione.",
        description_en: "All rooms are equipped with air conditioning, to ensure maximum comfort in every season.",
        icon: "snowflake",
        is_active: true,
      },
      {
        name_it: "Caffè e Tè",
        name_en: "Coffee and Tea",
        description_it:
          "Caffè e tè gratuiti disponibili tutto il giorno nella sala comune, per una pausa rilassante in qualsiasi momento.",
        description_en: "Free coffee and tea available all day in the common room, for a relaxing break at any time.",
        icon: "coffee",
        is_active: true,
      },
      {
        name_it: "Bagno Privato",
        name_en: "Private Bathroom",
        description_it: "Tutte le camere sono dotate di bagno privato con doccia, asciugacapelli e set di cortesia.",
        description_en: "All rooms have a private bathroom with shower, hairdryer and courtesy set.",
        icon: "bath",
        is_active: true,
      },
    ]

    // Seed attractions
    const attractions = [
      {
        name_it: "Firenze",
        name_en: "Florence",
        description_it:
          "Visita il centro storico di Firenze, patrimonio UNESCO, con i suoi musei, palazzi e chiese che custodiscono alcuni dei più importanti tesori artistici del mondo.",
        description_en:
          "Visit the historic center of Florence, a UNESCO World Heritage site, with its museums, palaces, and churches that house some of the most important artistic treasures in the world.",
        distance: "20 min in treno",
        image: "/placeholder.svg?height=400&width=600",
        is_active: true,
      },
      {
        name_it: "Chianti",
        name_en: "Chianti",
        description_it:
          "Esplora le colline del Chianti, famose per i vigneti, le cantine e i paesaggi mozzafiato. Degusta i vini locali e scopri la cucina tradizionale toscana.",
        description_en:
          "Explore the Chianti hills, famous for their vineyards, wineries, and breathtaking landscapes. Taste local wines and discover traditional Tuscan cuisine.",
        distance: "30 min in auto",
        image: "/placeholder.svg?height=400&width=600",
        is_active: true,
      },
      {
        name_it: "Siena",
        name_en: "Siena",
        description_it:
          "Visita Siena, con la sua famosa Piazza del Campo, il Duomo e le strade medievali. Una delle città più belle della Toscana, ricca di storia e tradizioni.",
        description_en:
          "Visit Siena, with its famous Piazza del Campo, the Cathedral, and medieval streets. One of the most beautiful cities in Tuscany, rich in history and traditions.",
        distance: "1 ora in auto",
        image: "/placeholder.svg?height=400&width=600",
        is_active: true,
      },
    ]

    // Seed content
    const content = [
      {
        section: "home",
        key: "welcome",
        content_it: "Benvenuti a Leonardo's Rooms",
        content_en: "Welcome to Leonardo's Rooms",
      },
      {
        section: "home",
        key: "subtitle",
        content_it: "Il tuo soggiorno perfetto a Pontassieve, vicino a Firenze",
        content_en: "Your perfect stay in Pontassieve, near Florence",
      },
      {
        section: "home",
        key: "about",
        content_it:
          "Leonardo's Rooms è un accogliente B&B situato a Pontassieve, in posizione strategica per visitare Firenze e la Toscana. Offriamo camere confortevoli e un servizio personalizzato per rendere il vostro soggiorno indimenticabile.",
        content_en:
          "Leonardo's Rooms is a cozy B&B located in Pontassieve, in a strategic position to visit Florence and Tuscany. We offer comfortable rooms and personalized service to make your stay unforgettable.",
      },
      {
        section: "services",
        key: "title",
        content_it: "I Nostri Servizi",
        content_en: "Our Services",
      },
      {
        section: "services",
        key: "subtitle",
        content_it: "Comfort e comodità per il tuo soggiorno",
        content_en: "Comfort and convenience for your stay",
      },
      {
        section: "attractions",
        key: "title",
        content_it: "Attrazioni Nelle Vicinanze",
        content_en: "Nearby Attractions",
      },
      {
        section: "attractions",
        key: "subtitle",
        content_it: "Scopri le meraviglie della Toscana",
        content_en: "Discover the wonders of Tuscany",
      },
      {
        section: "rooms",
        key: "title",
        content_it: "Le Nostre Camere",
        content_en: "Our Rooms",
      },
      {
        section: "rooms",
        key: "subtitle",
        content_it: "Comfort e stile per il tuo soggiorno",
        content_en: "Comfort and style for your stay",
      },
      {
        section: "contact",
        key: "title",
        content_it: "Contattaci",
        content_en: "Contact Us",
      },
      {
        section: "contact",
        key: "subtitle",
        content_it: "Siamo qui per aiutarti",
        content_en: "We're here to help",
      },
      {
        section: "booking",
        key: "title",
        content_it: "Prenota Ora",
        content_en: "Book Now",
      },
      {
        section: "booking",
        key: "subtitle",
        content_it: "Prenota direttamente per le migliori tariffe",
        content_en: "Book directly for the best rates",
      },
    ]

    // Seed settings
    const settings = [
      {
        key: "contact_info",
        value: {
          address: "Via Piave, 7, 50065 Pontassieve (FI), Italia",
          phone: "+39 360923824",
          email: "info@leonardosrooms.it",
          whatsapp: "+39 360923824",
        },
      },
      {
        key: "booking_settings",
        value: {
          check_in_time: "14:00",
          check_out_time: "10:00",
          min_nights: 1,
          max_nights: 30,
          advance_booking_days: 365,
        },
      },
    ]

    // Seed availability for the next 90 days
    const availabilityEntries = []
    const today = new Date()

    // Get all rooms first
    const { data: existingRooms } = await supabase.from("rooms").select("id")

    if (existingRooms && existingRooms.length > 0) {
      for (const room of existingRooms) {
        for (let i = 0; i < 90; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          const dateString = date.toISOString().split("T")[0]

          // Random price variation between -10% and +20% of base price
          const { data: roomData } = await supabase.from("rooms").select("base_price").eq("id", room.id).single()
          const basePrice = roomData?.base_price || 80
          const priceVariation = basePrice * (Math.random() * 0.3 - 0.1) // Between -10% and +20%
          const price = Math.round((basePrice + priceVariation) * 100) / 100

          availabilityEntries.push({
            room_id: room.id,
            date: dateString,
            is_available: Math.random() > 0.2, // 80% chance of being available
            price: price,
          })
        }
      }
    }

    // Insert data into tables
    const { error: roomsError } = await supabase.from("rooms").insert(rooms)
    if (roomsError && roomsError.code !== "23505") throw roomsError // Ignore duplicate key errors

    const { error: servicesError } = await supabase.from("services").insert(services)
    if (servicesError && servicesError.code !== "23505") throw servicesError

    const { error: attractionsError } = await supabase.from("attractions").insert(attractions)
    if (attractionsError && attractionsError.code !== "23505") throw attractionsError

    const { error: contentError } = await supabase.from("content").insert(content)
    if (contentError && contentError.code !== "23505") throw contentError

    const { error: settingsError } = await supabase.from("settings").insert(settings)
    if (settingsError && settingsError.code !== "23505") throw settingsError

    // Insert availability data if we have any
    if (availabilityEntries.length > 0) {
      // Insert in batches to avoid request size limits
      const batchSize = 100
      for (let i = 0; i < availabilityEntries.length; i += batchSize) {
        const batch = availabilityEntries.slice(i, i + batchSize)
        const { error: availabilityError } = await supabase.from("availability").insert(batch)
        if (availabilityError && availabilityError.code !== "23505") throw availabilityError
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        rooms: rooms.length,
        services: services.length,
        attractions: attractions.length,
        content: content.length,
        settings: settings.length,
        availability: availabilityEntries.length,
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
