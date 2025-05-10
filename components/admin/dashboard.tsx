"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemStatus } from "@/components/admin/system-status"
import { createClientSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { CalendarDays, Users, Home, CreditCard, TrendingUp, AlertTriangle } from "lucide-react"

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalGuests: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    availabilityIssues: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClientSupabaseClient()

        // Fetch rooms stats
        const { data: rooms, error: roomsError } = await supabase.from("rooms").select("id, is_active")

        if (roomsError) throw roomsError

        // Fetch bookings stats
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("id, status, total_price")

        if (bookingsError) throw bookingsError

        // Fetch guests stats
        const { data: guests, error: guestsError } = await supabase.from("guests").select("count", { count: "exact" })

        if (guestsError) throw guestsError

        // Fetch availability issues
        const { data: availability, error: availabilityError } = await supabase
          .from("availability")
          .select("id, is_available, room_id, date")
          .eq("is_available", false)
          .gte("date", new Date().toISOString().split("T")[0])

        if (availabilityError) throw availabilityError

        // Calculate stats
        const totalRooms = rooms?.length || 0
        const activeRooms = rooms?.filter((room) => room.is_active).length || 0
        const totalBookings = bookings?.length || 0
        const pendingBookings = bookings?.filter((booking) => booking.status === "pending").length || 0
        const confirmedBookings = bookings?.filter((booking) => booking.status === "confirmed").length || 0
        const cancelledBookings = bookings?.filter((booking) => booking.status === "cancelled").length || 0
        const totalGuests = guests?.[0]?.count || 0
        const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

        // Calculate occupancy rate (simplified)
        const occupancyRate = totalRooms > 0 ? (confirmedBookings / (totalRooms * 30)) * 100 : 0

        // Count availability issues
        const availabilityIssues = availability?.length || 0

        setStats({
          totalRooms,
          activeRooms,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          cancelledBookings,
          totalGuests,
          totalRevenue,
          occupancyRate: Math.min(Math.round(occupancyRate), 100),
          availabilityIssues,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="system">Stato Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Camere</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeRooms}</div>
                <p className="text-xs text-muted-foreground">su {stats.totalRooms} totali</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prenotazioni</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingBookings} in attesa, {stats.cancelledBookings} cancellate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ospiti</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGuests}</div>
                <p className="text-xs text-muted-foreground">registrati nel sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fatturato</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">dalle prenotazioni confermate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasso di Occupazione</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                <div className="mt-4 h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${stats.occupancyRate}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Percentuale di camere occupate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Problemi di Disponibilità</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availabilityIssues}</div>
                <p className="text-xs text-muted-foreground">date bloccate nei prossimi giorni</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Azioni Consigliate</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  {stats.pendingBookings > 0 && <li>• Conferma {stats.pendingBookings} prenotazioni in attesa</li>}
                  {stats.availabilityIssues > 0 && (
                    <li>• Verifica {stats.availabilityIssues} problemi di disponibilità</li>
                  )}
                  {stats.occupancyRate < 50 && <li>• Considera promozioni per aumentare le prenotazioni</li>}
                  <li>• Esegui gli agenti MiMo per ottimizzare i prezzi</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <SystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
