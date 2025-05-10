import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createServerSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

export async function FeaturedRooms() {
  const supabase = createServerSupabaseClient()

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("base_price", { ascending: true })
    .limit(3)

  if (error) {
    console.error("Error fetching rooms:", error)
    return <div>Errore nel caricamento delle camere</div>
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {rooms.map((room) => (
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
            <div className="flex justify-between text-sm">
              <span>Max: {room.max_guests} ospiti</span>
              <span>{room.size_sqm} m²</span>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button asChild className="w-full">
              <Link href={`/rooms/${room.id}`}>Vedi Dettagli</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
