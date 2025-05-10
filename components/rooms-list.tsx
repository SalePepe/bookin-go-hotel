import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

export async function RoomsList() {
  const supabase = createServerSupabaseClient()

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("base_price", { ascending: true })

  if (error) {
    console.error("Error fetching rooms:", error)
    return <div>Errore nel caricamento delle camere</div>
  }

  // Se non ci sono camere nel database, mostriamo delle camere predefinite
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

  const displayRooms = rooms && rooms.length > 0 ? rooms : defaultRooms

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayRooms.map((room) => (
        <Card key={room.id} className="overflow-hidden room-card">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={room.images[0] || "/placeholder.svg?height=200&width=400"}
              alt={room.name}
              fill
              className="object-cover room-image"
            />
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
              {formatCurrency(room.base_price)} / notte
            </Badge>
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">{room.name}</h3>
            <p className="text-muted-foreground mb-4">{room.short_description}</p>
            <div className="flex justify-between text-sm mb-4">
              <span>Max: {room.max_guests} ospiti</span>
              <span>{room.size_sqm} m²</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.isArray(room.amenities) &&
                room.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              {Array.isArray(room.amenities) && room.amenities.length > 3 && (
                <Badge variant="outline">+{room.amenities.length - 3}</Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0 flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/rooms/${room.id}`}>Vedi Dettagli</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/booking?roomId=${room.id}`}>Prenota</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
