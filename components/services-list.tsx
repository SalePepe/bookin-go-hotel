import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase"
import { Wifi, Coffee, Car, Wind, Utensils, ShowerHead, Tv, Snowflake, Key, Clock, Shirt, Map } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-12 w-12 text-primary" />,
  coffee: <Coffee className="h-12 w-12 text-primary" />,
  parking: <Car className="h-12 w-12 text-primary" />,
  ac: <Wind className="h-12 w-12 text-primary" />,
  breakfast: <Utensils className="h-12 w-12 text-primary" />,
  shower: <ShowerHead className="h-12 w-12 text-primary" />,
  tv: <Tv className="h-12 w-12 text-primary" />,
  aircon: <Snowflake className="h-12 w-12 text-primary" />,
  checkin: <Key className="h-12 w-12 text-primary" />,
  reception: <Clock className="h-12 w-12 text-primary" />,
  laundry: <Shirt className="h-12 w-12 text-primary" />,
  info: <Map className="h-12 w-12 text-primary" />,
}

export async function ServicesList() {
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
      description_it:
        "Connessione Wi-Fi ad alta velocità disponibile in tutta la struttura, per rimanere sempre connessi durante il vostro soggiorno.",
      description_en:
        "High-speed Wi-Fi connection available throughout the property, to stay connected during your stay.",
      icon: "wifi",
    },
    {
      id: "2",
      name_it: "Colazione Inclusa",
      name_en: "Breakfast Included",
      description_it:
        "Colazione continentale inclusa con prodotti locali e fatti in casa, servita ogni mattina nella sala colazione.",
      description_en:
        "Continental breakfast included with local and homemade products, served every morning in the breakfast room.",
      icon: "breakfast",
    },
    {
      id: "3",
      name_it: "Parcheggio Gratuito",
      name_en: "Free Parking",
      description_it:
        "Parcheggio gratuito disponibile per tutti gli ospiti, per la massima comodità durante il vostro soggiorno.",
      description_en: "Free parking available for all guests, for maximum convenience during your stay.",
      icon: "parking",
    },
    {
      id: "4",
      name_it: "Aria Condizionata",
      name_en: "Air Conditioning",
      description_it:
        "Tutte le camere sono dotate di aria condizionata, per garantire il massimo comfort in ogni stagione.",
      description_en: "All rooms are equipped with air conditioning, to ensure maximum comfort in every season.",
      icon: "aircon",
    },
    {
      id: "5",
      name_it: "Caffè e Tè",
      name_en: "Coffee and Tea",
      description_it:
        "Caffè e tè gratuiti disponibili tutto il giorno nella sala comune, per una pausa rilassante in qualsiasi momento.",
      description_en: "Free coffee and tea available all day in the common room, for a relaxing break at any time.",
      icon: "coffee",
    },
    {
      id: "6",
      name_it: "Bagno Privato",
      name_en: "Private Bathroom",
      description_it: "Tutte le camere sono dotate di bagno privato con doccia, asciugacapelli e set di cortesia.",
      description_en: "All rooms have a private bathroom with shower, hairdryer and courtesy set.",
      icon: "shower",
    },
    {
      id: "7",
      name_it: "TV a Schermo Piatto",
      name_en: "Flat Screen TV",
      description_it: "Ogni camera è dotata di TV a schermo piatto con canali nazionali e internazionali.",
      description_en: "Each room is equipped with a flat screen TV with national and international channels.",
      icon: "tv",
    },
    {
      id: "8",
      name_it: "Check-in Flessibile",
      name_en: "Flexible Check-in",
      description_it: "Possibilità di check-in flessibile su richiesta, per adattarsi alle vostre esigenze di viaggio.",
      description_en: "Flexible check-in available on request, to adapt to your travel needs.",
      icon: "checkin",
    },
    {
      id: "9",
      name_it: "Informazioni Turistiche",
      name_en: "Tourist Information",
      description_it:
        "Informazioni turistiche e consigli su cosa visitare a Firenze e nei dintorni, per aiutarvi a pianificare il vostro soggiorno.",
      description_en:
        "Tourist information and advice on what to visit in Florence and the surrounding area, to help you plan your stay.",
      icon: "info",
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
                <Coffee className="h-12 w-12 text-primary" />
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
