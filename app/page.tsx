import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchForm } from "@/components/search-form"
import { FeaturedRooms } from "@/components/featured-rooms"
import { Services } from "@/components/services"
import { Attractions } from "@/components/attractions"

export const metadata: Metadata = {
  title: "Leonardo's Rooms - B&B a Pontassieve, Firenze",
  description:
    "Bed & Breakfast a Pontassieve, posizione strategica per Firenze. Prenotazione diretta, risposte rapide via WhatsApp.",
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section relative h-[80vh] flex items-center justify-center text-white">
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Leonardo&apos;s Rooms</h1>
          <p className="text-xl md:text-2xl mb-8">Il tuo soggiorno perfetto a Pontassieve, vicino a Firenze</p>
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-lg">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Chi Siamo</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Leonardo&apos;s Rooms è un accogliente B&B situato a Pontassieve, in posizione strategica per visitare
                Firenze e la Toscana. Offriamo camere confortevoli e un servizio personalizzato per rendere il vostro
                soggiorno indimenticabile.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                La nostra struttura si trova a soli 20 minuti di treno da Firenze, permettendovi di godere della
                tranquillità della campagna toscana pur rimanendo vicini alle principali attrazioni turistiche.
              </p>
              <Button asChild size="lg">
                <Link href="/rooms">Scopri le nostre camere</Link>
              </Button>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image src="/placeholder.svg?height=400&width=600" alt="Leonardo's Rooms" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Le Nostre Camere</h2>
          <p className="text-lg text-muted-foreground mb-12 text-center">
            Scopri le nostre camere confortevoli e accoglienti
          </p>
          <Suspense fallback={<RoomsSkeleton />}>
            <FeaturedRooms />
          </Suspense>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/rooms">Vedi tutte le camere</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">I Nostri Servizi</h2>
          <p className="text-lg text-muted-foreground mb-12 text-center">
            Offriamo una varietà di servizi per rendere il vostro soggiorno confortevole
          </p>
          <Suspense fallback={<ServicesSkeleton />}>
            <Services />
          </Suspense>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">Scopri tutti i servizi</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Attractions Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">Attrazioni Nelle Vicinanze</h2>
          <p className="text-lg text-muted-foreground mb-12 text-center">
            Esplora le meraviglie di Firenze e della Toscana
          </p>
          <Suspense fallback={<AttractionsSkeleton />}>
            <Attractions />
          </Suspense>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/services">Scopri tutte le attrazioni</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prenota il tuo soggiorno oggi</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Approfitta delle nostre tariffe speciali e prenota direttamente per ottenere il miglior prezzo garantito.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/booking">Prenota Ora</Link>
          </Button>
        </div>
      </section>
    </>
  )
}

function RoomsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-48 w-full rounded-t-lg" />
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ServicesSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AttractionsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-48 w-full rounded-t-lg" />
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
