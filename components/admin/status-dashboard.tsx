"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bed, Calendar, Users, BookOpen, AlertTriangle } from "lucide-react"

export function StatusDashboard() {
  const [stats, setStats] = useState({
    rooms: { total: 0, active: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
    availability: { total: 0, available: 0, occupied: 0, blocked: 0 },
    occupancyRate: 0,
    issues: [] as string[],
    isLoading: true,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClientSupabaseClient()

      try {
        // Camere
        const { data: rooms, error: roomsError } = await supabase.from("rooms").select("id, is_active")

        if (roomsError) throw roomsError

        // Prenotazioni
        const { data: bookings, error: bookingsError } = await supabase.from("bookings").select("id, status")

        if (bookingsError) throw bookingsError

        // Disponibilità (prossimi 30 giorni)
        const today = new Date()
        const futureDate = new Date()
        futureDate.setDate(today.getDate() + 30)

        const { data: availability, error: availabilityError } = await supabase
          .from("availability")
          .select("id, is_available")
          .gte("date", today.toISOString().split("T")[0])
          .lte("date", futureDate.toISOString().split("T")[0])

        if (availabilityError) throw availabilityError

        // Calcolo delle statistiche
        const roomStats = {
          total: rooms?.length || 0,
          active: rooms?.filter((r) => r.is_active).length || 0,
        }

        const bookingStats = {
          total: bookings?.length || 0,
          pending: bookings?.filter((b) => b.status === "pending").length || 0,
          confirmed: bookings?.filter((b) => b.status === "confirmed").length || 0,
          completed: bookings?.filter((b) => b.status === "completed").length || 0,
          cancelled: bookings?.filter((b) => b.status === "cancelled").length || 0,
        }

        const availabilityStats = {
          total: availability?.length || 0,
          available: availability?.filter((a) => a.is_available).length || 0,
          occupied: availability?.filter((a) => !a.is_available).length || 0,
          blocked: 0, // Questo richiederebbe un'analisi più complessa
        }

        // Tasso di occupazione (numero di giorni occupati / numero totale di giorni disponibili)
        const occupancyRate =
          availabilityStats.total > 0 ? (availabilityStats.occupied / availabilityStats.total) * 100 : 0

        setStats({
          rooms: roomStats,
          bookings: bookingStats,
          availability: availabilityStats,
          occupancyRate,
          issues: [],
          isLoading: false,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        setStats((prev) => ({
          ...prev,
          issues: ["Errore nel caricamento delle statistiche"],
          isLoading: false,
        }))
      }
    }

    fetchStats()
  }, [])

  // Formatta numeri per la visualizzazione
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Funzioni per ottenere i colori in base ai valori
  const getOccupancyColor = (rate: number) => {
    if (rate < 30) return "text-red-500"
    if (rate < 70) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Camere</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.rooms.total)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.rooms.active} attive ({Math.round((stats.rooms.active / stats.rooms.total) * 100) || 0}%)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prenotazioni</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.bookings.total)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.bookings.confirmed} confermate, {stats.bookings.pending} in attesa
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasso di Occupazione</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getOccupancyColor(stats.occupancyRate)}`}>
            {Math.round(stats.occupancyRate)}%
          </div>
          <Progress value={stats.occupancyRate} className="h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disponibilità (30 giorni)</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.availability.available)}</div>
          <p className="text-xs text-muted-foreground">su {formatNumber(stats.availability.total)} giorni totali</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Dettaglio</CardTitle>
          <CardDescription>Visualizza i dettagli delle prenotazioni e della disponibilità</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bookings">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings">Prenotazioni</TabsTrigger>
              <TabsTrigger value="availability">Disponibilità</TabsTrigger>
              <TabsTrigger value="issues">Problemi</TabsTrigger>
            </TabsList>
            <TabsContent value="bookings" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Totali</div>
                  <div className="text-xl font-bold">{formatNumber(stats.bookings.total)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Confermate</div>
                  <div className="text-xl font-bold">{formatNumber(stats.bookings.confirmed)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">In Attesa</div>
                  <div className="text-xl font-bold">{formatNumber(stats.bookings.pending)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Cancellate</div>
                  <div className="text-xl font-bold">{formatNumber(stats.bookings.cancelled)}</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="availability" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Disponibili</div>
                  <div className="text-xl font-bold">{formatNumber(stats.availability.available)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Occupati</div>
                  <div className="text-xl font-bold">{formatNumber(stats.availability.occupied)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Bloccati</div>
                  <div className="text-xl font-bold">{formatNumber(stats.availability.blocked)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Tasso Occupazione</div>
                  <div className={`text-xl font-bold ${getOccupancyColor(stats.occupancyRate)}`}>
                    {Math.round(stats.occupancyRate)}%
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="issues" className="mt-4">
              {stats.issues.length > 0 ? (
                <div className="space-y-2">
                  {stats.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-2 border rounded-lg p-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="text-sm">{issue}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                  Nessun problema rilevato
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
