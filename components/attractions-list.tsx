import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function AttractionsList() {
  const supabase = createServerSupabaseClient()

  const { data: attractions, error } = await supabase
    .from("attractions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })

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
        "Visita il centro storico di Firenze, patrimonio UNESCO, con i suoi musei, palazzi e chiese che custodiscono alcuni dei più importanti tesori artistici del mondo. La Galleria degli Uffizi, il Duomo, Ponte Vecchio e Palazzo Pitti sono solo alcune delle meraviglie da scoprire.",
      description_en:
        "Visit the historic center of Florence, a UNESCO World Heritage site, with its museums, palaces, and churches that house some of the most important artistic treasures in the world. The Uffizi Gallery, the Duomo, Ponte Vecchio, and Palazzo Pitti are just some of the wonders to discover.",
      distance: "20 min in treno",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "2",
      name_it: "Chianti",
      name_en: "Chianti",
      description_it:
        "Esplora le colline del Chianti, famose per i vigneti, le cantine e i paesaggi mozzafiato. Degusta i vini locali e scopri la cucina tradizionale toscana nei caratteristici borghi medievali come Greve in Chianti, Castellina in Chianti e Radda in Chianti.",
      description_en:
        "Explore the Chianti hills, famous for their vineyards, wineries, and breathtaking landscapes. Taste local wines and discover traditional Tuscan cuisine in the characteristic medieval villages such as Greve in Chianti, Castellina in Chianti, and Radda in Chianti.",
      distance: "30 min in auto",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "3",
      name_it: "Siena",
      name_en: "Siena",
      description_it:
        "Visita Siena, con la sua famosa Piazza del Campo, il Duomo e le strade medievali. Una delle città più belle della Toscana, ricca di storia e tradizioni, famosa per il Palio, la corsa di cavalli che si tiene due volte all'anno nella piazza principale.",
      description_en:
        "Visit Siena, with its famous Piazza del Campo, the Cathedral, and medieval streets. One of the most beautiful cities in Tuscany, rich in history and traditions, famous for the Palio, the horse race that takes place twice a year in the main square.",
      distance: "1 ora in auto",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "4",
      name_it: "San Gimignano",
      name_en: "San Gimignano",
      description_it:
        "Scopri San Gimignano, la città delle torri medievali, patrimonio UNESCO. Passeggia per le strade acciottolate, ammira le torri che si stagliano contro il cielo e assapora il famoso vino Vernaccia di San Gimignano nelle enoteche locali.",
      description_en:
        "Discover San Gimignano, the city of medieval towers, a UNESCO World Heritage site. Walk through the cobbled streets, admire the towers that stand out against the sky, and taste the famous Vernaccia di San Gimignano wine in local wine shops.",
      distance: "1 ora e 15 min in auto",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "5",
      name_it: "Pisa",
      name_en: "Pisa",
      description_it:
        "Visita Pisa e la sua famosa Torre Pendente, parte del complesso monumentale di Piazza dei Miracoli, patrimonio UNESCO. Oltre alla torre, potrai ammirare il Duomo, il Battistero e il Camposanto Monumentale.",
      description_en:
        "Visit Pisa and its famous Leaning Tower, part of the monumental complex of Piazza dei Miracoli, a UNESCO World Heritage site. In addition to the tower, you can admire the Cathedral, the Baptistery, and the Monumental Cemetery.",
      distance: "1 ora e 30 min in auto",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "6",
      name_it: "Lucca",
      name_en: "Lucca",
      description_it:
        "Esplora Lucca, città circondata da mura rinascimentali perfettamente conservate. Passeggia o pedala lungo le mura, visita le numerose chiese, tra cui il Duomo di San Martino, e goditi l'atmosfera unica di questa città toscana.",
      description_en:
        "Explore Lucca, a city surrounded by perfectly preserved Renaissance walls. Walk or cycle along the walls, visit the numerous churches, including the Cathedral of San Martino, and enjoy the unique atmosphere of this Tuscan city.",
      distance: "1 ora e 15 min in auto",
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
