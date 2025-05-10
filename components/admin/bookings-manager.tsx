"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createClientSupabaseClient } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"

interface BookingsManagerProps {
  initialBookings: any[]
}

interface BookingsListProps {
  bookings: any[]
  onViewBooking: (booking: any) => void
  getStatusBadgeVariant: (status: string) => string
}

function BookingsList({ bookings, onViewBooking, getStatusBadgeVariant }: BookingsListProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <CardTitle>{booking.property_name}</CardTitle>
            <CardDescription>
              {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Ospite:</strong> {booking.guest_name}
              </p>
              <p>
                <strong>Email:</strong> {booking.guest_email}
              </p>
              <p>
                <strong>Telefono:</strong> {booking.guest_phone}
              </p>
              <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button onClick={() => onViewBooking(booking)}>Visualizza</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function BookingsManager({ initialBookings }: BookingsManagerProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()
  
  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking)
    setIsDialogOpen(true)
  }
  
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
      
      if (error) throw error
      
      // Update local state
      setBookings(bookings.map(booking => booking.id === bookingId ? { ...booking, status: newStatus } : booking))
      
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus })
      }
      
      toast({
        title: 'Stato aggiornato',
        description: `La prenotazione è stata aggiornata a "${newStatus}".`,
      })
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'aggiornamento dello stato della prenotazione.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
      
      if (error) throw error
      
      // Update local state
      setBookings(bookings.filter(booking => booking.id !== bookingId))
      
      setIsDialogOpen(false)
      
      toast({
        title: 'Prenotazione eliminata',
        description: 'La prenotazione è stata eliminata con successo.',
      })
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'eliminazione della prenotazione.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBooking) return
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ notes: selectedBooking.notes })
        .eq('id', selectedBooking.id)
      
      if (error) throw error
      
      // Update local state
      setBookings(bookings.map(booking => booking.id === selectedBooking.id ? { ...booking, notes: selectedBooking.notes } : booking))
      
      toast({
        title: 'Note aggiornate',
        description: 'Le note della prenotazione sono state aggiornate con successo.',
      })
    } catch (error) {
      console.error('Error updating booking notes:', error)
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore durante l\'aggiornamento delle note della prenotazione.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'pending':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      case 'completed':
        return 'secondary'
      default:
        return 'outline'
    }
  }
  
  const filterUpcomingBookings = () => {
    const today = new Date()
    return bookings.filter(booking => new Date(booking.check_in) >= today)
  }
  
  const filterPastBookings = () => {
    const today = new Date()
    return bookings.filter(booking => new Date(booking.check_out) < today)
  }
  
  const filterCurrentBookings = () => {
    const today = new Date()
    return bookings.filter(booking => 
      new Date(booking.check_in) <= today && new Date(booking.check_out) >= today
    )
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Prenotazioni</h1>
        <Button asChild>
          <a href="/admin/bookings/new">Nuova Prenotazione</a>
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tutte</TabsTrigger>
          <TabsTrigger value="upcoming">In Arrivo</TabsTrigger>
          <TabsTrigger value="current">Attuali</TabsTrigger>
          <TabsTrigger value="past">Passate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {bookings.length > 0 ? (
            <BookingsList
              bookings={bookings}
              onViewBooking={handleViewBooking}
              getStatusBadgeVariant={getStatusBadgeVariant}
            />
          ) : (
            <p className="text-muted-foreground">Nessuna prenotazione disponibile</p>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {filterUpcomingBookings().length > 0 ? (
            <BookingsList
              bookings={filterUpcomingBookings()}
              onViewBooking={handleViewBooking}
              getStatusBadgeVariant={getStatusBadgeVariant}
            />
          ) : (
            <p className="text-muted-foreground">Nessuna prenotazione in arrivo</p>
          )}
        </TabsContent>
        
        <TabsContent value="current" className="space-y-4">
          {filterCurrentBookings().length > 0 ? (
            <BookingsList
              bookings={filterCurrentBookings()}
              onViewBooking={handleViewBooking}
              getStatusBadgeVariant={getStatusBadgeVariant}
            />
          ) : (
            <p className="text-muted-foreground">Nessuna prenotazione attuale</p>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {filterPastBookings().length > 0 ? (
            <BookingsList
              bookings={filterPastBookings()}
              onViewBooking={handleViewBooking}
              getStatusBadgeVariant={getStatusBadgeVariant}
            />
          ) : (
            <p className="text-muted-foreground">Nessuna prenotazione passata</p>
          )}
        </TabsContent>
    </div>
  )
}
