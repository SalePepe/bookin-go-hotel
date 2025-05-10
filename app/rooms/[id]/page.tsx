import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RoomDetail } from "@/components/room-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { createServerSupabaseClient } from "@/lib/supabase"

interface RoomPageProps {
  params: {
    id: string
  }
}

// Helper function to check if a string is a valid UUID
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

async function getRoomById(id: string) {
  const supabase = createServerSupabaseClient()

  // If the ID is a valid UUID, try to fetch directly
  if (isValidUUID(id)) {
    const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single()
    if (!error && data) {
      return data
    }
  }

  // If the ID is not a UUID or the direct fetch failed, try to find by numeric ID
  // This handles cases like /rooms/1, /rooms/2, etc.
  try {
    const numericId = Number.parseInt(id, 10)
    if (!isNaN(numericId)) {
      const { data: rooms } = await supabase.from("rooms").select("*").eq("is_active", true)

      if (rooms && rooms.length > 0) {
        // If numericId is within range, return that room
        if (numericId > 0 && numericId <= rooms.length) {
          return rooms[numericId - 1]
        }
      }
    }
  } catch (error) {
    console.error("Error parsing room ID:", error)
  }

  // If all else fails, try to get default rooms
  const defaultRooms = [
    {
      id: "1",
      name: "Camera Doppia Standard",
      short_description: "Confortevole camera doppia con bagno privato",
      description:
        "La nostra Camera Doppia Standard offre tutto il comfort necessario per un soggiorno piacevole. Dotata di letto matrimoniale, bagno privato con doccia, aria condizionata, TV a schermo piatto e Wi-Fi gratuito.",
      base_price: 80,
      max_guests: 2,
      size_sqm: 18,
      beds: "Matrimoniale",
      amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli"],
      images: ["/placeholder.svg?height=200&width=400"],
      is_active: true,
    },
    {
      id: "2",
      name: "Camera Tripla",
      short_description: "Spaziosa camera per tre persone con vista giardino",
      description:
        "La nostra Camera Tripla è perfetta per famiglie o piccoli gruppi. Dotata di un letto matrimoniale e un letto singolo, bagno privato con doccia, aria condizionata, TV a schermo piatto e Wi-Fi gratuito. Dalla finestra si gode una piacevole vista sul giardino.",
      base_price: 110,
      max_guests: 3,
      size_sqm: 22,
      beds: "Matrimoniale + Singolo",
      amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli", "Vista giardino"],
      images: ["/placeholder.svg?height=200&width=400"],
      is_active: true,
    },
    {
      id: "3",
      name: "Camera Matrimoniale Superior",
      short_description: "Elegante camera con balcone privato",
      description:
        "La nostra Camera Matrimoniale Superior offre un'esperienza di soggiorno di livello superiore. Dotata di letto matrimoniale, bagno privato con doccia, aria condizionata, TV a schermo piatto, Wi-Fi gratuito e un balcone privato dove rilassarsi e godere della vista.",
      base_price: 95,
      max_guests: 2,
      size_sqm: 20,
      beds: "Matrimoniale",
      amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli", "Balcone"],
      images: ["/placeholder.svg?height=200&width=400"],
      is_active: true,
    },
    {
      id: "4",
      name: "Camera Singola",
      short_description: "Accogliente camera singola per viaggiatori solitari",
      description:
        "La nostra Camera Singola è l'ideale per chi viaggia da solo. Compatta ma confortevole, è dotata di letto singolo, bagno privato con doccia, aria condizionata, TV a schermo piatto e Wi-Fi gratuito.",
      base_price: 60,
      max_guests: 1,
      size_sqm: 14,
      beds: "Singolo",
      amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli"],
      images: ["/placeholder.svg?height=200&width=400"],
      is_active: true,
    },
    {
      id: "5",
      name: "Suite Familiare",
      short_description: "Ampia suite ideale per famiglie fino a 4 persone",
      description:
        "La nostra Suite Familiare è la soluzione perfetta per famiglie. Spaziosa e confortevole, è dotata di una camera con letto matrimoniale e una camera con due letti singoli, bagno privato con doccia, aria condizionata, TV a schermo piatto e Wi-Fi gratuito.",
      base_price: 140,
      max_guests: 4,
      size_sqm: 30,
      beds: "Matrimoniale + 2 Singoli",
      amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato", "Asciugacapelli", "Due camere separate"],
      images: ["/placeholder.svg?height=200&width=400"],
      is_active: true,
    },
    {
      id: "6",
      name: "Camera Doppia Economy",
      short_description: "Camera doppia essenziale a prezzo conveniente",
      description:
        "La nostra Camera Doppia Economy offre tutti i servizi essenziali a un prezzo conveniente. Dotata di letto matrimoniale, bagno privato con doccia, aria condizionata, TV e Wi-Fi gratuito.",
      base_price: 70,
      max_guests: 2,
      size_sqm: 16,
      beds: "Matrimoniale",
      amenities: ["Wi-Fi", "Aria condizionata", "TV", "Bagno privato"],
      images: ["/placeholder.svg?height=200&width=400"],
      is_active: true,
    },
  ]

  // Find the default room with the matching ID
  const defaultRoom = defaultRooms.find((room) => room.id === id)
  if (defaultRoom) {
    return defaultRoom
  }

  // If we still can't find a room, return null
  return null
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const room = await getRoomById(params.id)

  if (!room) {
    return {
      title: "Camera non trovata | Leonardo's Rooms",
      description: "La camera richiesta non è stata trovata.",
    }
  }

  return {
    title: `${room.name} | Leonardo's Rooms`,
    description: room.short_description,
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  const room = await getRoomById(params.id)

  if (!room) {
    notFound()
  }

  return (
    <>
      <Suspense fallback={<RoomDetailSkeleton />}>
        <RoomDetail room={room} />
      </Suspense>
    </>
  )
}

function RoomDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-4 w-2/3 mb-8" />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between mt-6">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          <Skeleton className="h-10 w-full mt-6" />
        </div>
      </div>

      <Skeleton className="h-6 w-1/4 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>

      <Skeleton className="h-6 w-1/4 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
