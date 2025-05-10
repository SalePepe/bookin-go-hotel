import { Suspense } from "react"
import type { Metadata } from "next"
import { ServicesList } from "@/components/services-list"
import { AttractionsList } from "@/components/attractions-list"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Servizi & Attrazioni | Leonardo's Rooms",
  description:
    "Scopri i servizi offerti da Leonardo's Rooms e le attrazioni nelle vicinanze. Posizione strategica per visitare Firenze e la Toscana.",
}

export default function ServicesPage() {
  return (
    <>
      <section className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">Servizi & Attrazioni</h1>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            Scopri i servizi offerti da Leonardo&apos;s Rooms e le attrazioni nelle vicinanze. Posizione strategica per
            visitare Firenze e la Toscana.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">I Nostri Servizi</h2>
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesList />
          </Suspense>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Attrazioni Nelle Vicinanze</h2>
          <Suspense fallback={<AttractionsSkeleton />}>
            <AttractionsList />
          </Suspense>
        </div>
      </section>
    </>
  )
}

function ServicesSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

function AttractionsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
