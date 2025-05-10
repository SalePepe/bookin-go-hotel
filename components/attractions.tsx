import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function Attractions() {
  const supabase = createServerSupabaseClient()

  const { data: attractions, error } = await supabase
    .from("attractions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(3)

  if (error) {
    console.error("Error fetching attractions:", error)
    return <div>Errore nel caricamento delle attrazioni</div>
  }

  // Se non ci sono attrazioni nel database, mostriamo delle attrazioni predefinite
  const defaultAttractions = [
    {
      id: "1",
      name_it: "Firenze",
      name_en: "Florence",
      description_it:
        "Visita il centro storico di Firenze, patrimonio UNESCO, con i suoi musei, palazzi e chiese che custodiscono alcuni dei più importanti tesori artistici del mondo.",
      description_en:
        "Visit the historic center of Florence, a UNESCO World Heritage site, with its museums, palaces, and churches that house some of the most important artistic treasures in the world.",
      distance: "20 min in treno",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "2",
      name_it: "Chianti",
      name_en: "Chianti",
      description_it:
        "Esplora le colline del Chianti, famose per i vigneti, le cantine e i paesaggi mozzafiato. Degusta i vini locali e scopri la cucina tradizionale toscana.",
      description_en:
        "Explore the Chianti hills, famous for their vineyards, wineries, and breathtaking landscapes. Taste local wines and discover traditional Tuscan cuisine.",
      distance: "30 min in auto",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "3",
      name_it: "Siena",
      name_en: "Siena",
      description_it:
        "Visita Siena, con la sua famosa Piazza del Campo, il Duomo e le strade medievali. Una delle città più belle della Toscana, ricca di storia e tradizioni.",
      description_en:
        "Visit Siena, with its famous Piazza del Campo, the Cathedral, and medieval streets. One of the most beautiful cities in Tuscany, rich in history and traditions.",
      distance: "1 ora in auto",
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  const displayAttractions = attractions && attractions.length > 0 ? attractions : defaultAttractions

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayAttractions.map((attraction) => (
        <Card key={attraction.id} className="overflow-hidden">
          <div className="relative h-48">
            <Image
              src={attraction.image || "/placeholder.svg?height=200&width=400"}
              alt={attraction.name_it}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{attraction.name_it}</h3>
              <Badge variant="outline">{attraction.distance}</Badge>
            </div>
            <p className="text-muted-foreground">{attraction.description_it}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
