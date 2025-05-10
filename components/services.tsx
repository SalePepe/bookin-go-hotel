import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Wifi, Coffee, Car, Wind, Utensils, ShowerHead } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-10 w-10 text-primary" />,
  coffee: <Coffee className="h-10 w-10 text-primary" />,
  parking: <Car className="h-10 w-10 text-primary" />,
  ac: <Wind className="h-10 w-10 text-primary" />,
  breakfast: <Utensils className="h-10 w-10 text-primary" />,
  shower: <ShowerHead className="h-10 w-10 text-primary" />,
}

export async function Services() {
  const supabase = createServerSupabaseClient()

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching services:", error)
    return <div>Errore nel caricamento dei servizi</div>
  }

  // Se non ci sono servizi nel database, mostriamo dei servizi predefiniti
  const defaultServices = [
    {
      id: "1",
      name_it: "Wi-Fi Gratuito",
      name_en: "Free Wi-Fi",
      description_it: "Connessione Wi-Fi ad alta velocità disponibile in tutta la struttura.",
      description_en: "High-speed Wi-Fi connection available throughout the property.",
      icon: "wifi",
    },
    {
      id: "2",
      name_it: "Colazione Inclusa",
      name_en: "Breakfast Included",
      description_it: "Colazione continentale inclusa con prodotti locali e fatti in casa.",
      description_en: "Continental breakfast included with local and homemade products.",
      icon: "breakfast",
    },
    {
      id: "3",
      name_it: "Parcheggio Gratuito",
      name_en: "Free Parking",
      description_it: "Parcheggio gratuito disponibile per tutti gli ospiti.",
      description_en: "Free parking available for all guests.",
      icon: "parking",
    },
    {
      id: "4",
      name_it: "Aria Condizionata",
      name_en: "Air Conditioning",
      description_it: "Tutte le camere sono dotate di aria condizionata.",
      description_en: "All rooms are equipped with air conditioning.",
      icon: "ac",
    },
    {
      id: "5",
      name_it: "Caffè e Tè",
      name_en: "Coffee and Tea",
      description_it: "Caffè e tè gratuiti disponibili tutto il giorno.",
      description_en: "Free coffee and tea available all day.",
      icon: "coffee",
    },
    {
      id: "6",
      name_it: "Bagno Privato",
      name_en: "Private Bathroom",
      description_it: "Tutte le camere sono dotate di bagno privato con doccia.",
      description_en: "All rooms have a private bathroom with shower.",
      icon: "shower",
    },
  ]

  const displayServices = services && services.length > 0 ? services : defaultServices

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayServices.map((service) => (
        <Card key={service.id}>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="mb-4">
              {service.icon && iconMap[service.icon] ? (
                iconMap[service.icon]
              ) : (
                <Coffee className="h-10 w-10 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{service.name_it}</h3>
            <p className="text-muted-foreground">{service.description_it}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
