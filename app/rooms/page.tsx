import { Suspense } from "react"
import type { Metadata } from "next"
import { RoomsList } from "@/components/rooms-list"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Le Nostre Camere | Leonardo's Rooms",
  description:
    "Scopri le nostre camere confortevoli e accoglienti. Tutte le camere sono dotate di bagno privato, aria condizionata e Wi-Fi gratuito.",
}

export default function RoomsPage() {
  return (
    <>
      <section className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">Le Nostre Camere</h1>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            Scopri le nostre camere confortevoli e accoglienti. Tutte le camere sono dotate di bagno privato, aria
            condizionata e Wi-Fi gratuito.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <Suspense fallback={<RoomsSkeleton />}>
            <RoomsList />
          </Suspense>
        </div>
      </section>
    </>
  )
}

function RoomsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <div className="p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <div className="flex justify-between mb-6">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
