"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format, addDays } from "date-fns"
import { it, enUS } from "date-fns/locale"
import { CalendarIcon, Users, ArrowRight, ArrowLeft, Check, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Steps, Step } from "@/components/ui/steps"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { createClientSupabaseClient } from "@/lib/supabase"
import { formatCurrency, formatDate, calculateNights, generateBookingNumber } from "@/lib/utils"

interface BookingFormProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function BookingForm({ searchParams }: BookingFormProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [supabase, setSupabase] = useState<any>(null)

  // Initialize Supabase client
  useEffect(() => {
    try {
      const client = createClientSupabaseClient()
      setSupabase(client)
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'inizializzazione del client Supabase.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Form steps
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Dates and guests
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined)
  const [adults, setAdults] = useState("2")
  const [children, setChildren] = useState("0")

  // Step 2: Available rooms
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [partiallyAvailableRooms, setPartiallyAvailableRooms] = useState<any[]>([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [showPartialAvailability, setShowPartialAvailability] = useState(false)

  // Step 3: Selected room
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null)

  // Step 4: Guest details
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    specialRequests: "",
  })

  // Step 5: Booking confirmation
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingNumber, setBookingNumber] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)

  // Initialize form with search params if available
  useEffect(() => {
    if (!supabase) return

    const initializeFromSearchParams = async () => {
      try {
        if (searchParams.checkIn && typeof searchParams.checkIn === "string") {
          setCheckIn(new Date(searchParams.checkIn))
        }

        if (searchParams.checkOut && typeof searchParams.checkOut === "string") {
          setCheckOut(new Date(searchParams.checkOut))
        }

        if (searchParams.adults && typeof searchParams.adults === "string") {
          setAdults(searchParams.adults)
        }

        if (searchParams.children && typeof searchParams.children === "string") {
          setChildren(searchParams.children)
        }

        // If we have a roomId, we'll need to fetch that room
        if (searchParams.roomId && typeof searchParams.roomId === "string") {
          // Only fetch if it's a valid UUID
          if (isValidUUID(searchParams.roomId)) {
            await fetchRoom(searchParams.roomId)
          } else {
            // If not a valid UUID, try to fetch all rooms and find by another property
            // For example, if roomId might be a slug or a numeric ID
            await fetchRoomByAlternativeId(searchParams.roomId)
          }
        }

        // If we have dates, we can check availability immediately
        if (
          searchParams.checkIn &&
          searchParams.checkOut &&
          typeof searchParams.checkIn === "string" &&
          typeof searchParams.checkOut === "string"
        ) {
          const checkInDate = new Date(searchParams.checkIn)
          const checkOutDate = new Date(searchParams.checkOut)

          if (checkInDate && checkOutDate) {
            await checkAvailability(checkInDate, checkOutDate)
          }
        }
      } catch (error) {
        console.error("Error initializing from search params:", error)
      }
    }

    initializeFromSearchParams()
  }, [searchParams, supabase])

  // Fetch a specific room by UUID
  const fetchRoom = async (roomId: string) => {
    if (!supabase) return

    try {
      const { data: room, error } = await supabase.from("rooms").select("*").eq("id", roomId).single()

      if (error) throw error

      if (room) {
        setSelectedRoom(room)
        setCurrentStep(3) // Skip to room selection step
      }
    } catch (error) {
      console.error("Error fetching room:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il recupero della camera.",
        variant: "destructive",
      })
    }
  }

  // Fetch a room by alternative ID (like a numeric ID or slug)
  const fetchRoomByAlternativeId = async (alternativeId: string) => {
    if (!supabase) return

    try {
      // First, get all rooms
      const { data: rooms, error } = await supabase.from("rooms").select("*")

      if (error) throw error

      if (rooms && rooms.length > 0) {
        // Try to find the room by name or other property
        // This is just an example - adjust based on your actual data structure
        const room = rooms.find(
          (r) =>
            // Try to match by name (case insensitive)
            r.name.toLowerCase() === alternativeId.toLowerCase() ||
            // Or by a numeric position in the array (for simple numeric IDs)
            (Number.parseInt(alternativeId) > 0 &&
              Number.parseInt(alternativeId) <= rooms.length &&
              rooms[Number.parseInt(alternativeId) - 1]),
        )

        if (room) {
          setSelectedRoom(room)
          setCurrentStep(3) // Skip to room selection step
        } else {
          // If no room found, just show all rooms
          setAvailableRooms(rooms)
          setCurrentStep(2)
        }
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il recupero delle camere.",
        variant: "destructive",
      })
    }
  }

  // Check room availability using the new API endpoint
  const checkAvailability = async (startDate: Date, endDate: Date) => {
    if (!startDate || !endDate) return

    setIsCheckingAvailability(true)
    setAvailabilityError(null)

    try {
      // Format dates for the API
      const checkInStr = format(startDate, "yyyy-MM-dd")
      const checkOutStr = format(endDate, "yyyy-MM-dd")
      const totalGuests = Number.parseInt(adults) + Number.parseInt(children)

      // Call the new API endpoint
      const response = await fetch(
        `/api/rooms/available?check_in=${checkInStr}&check_out=${checkOutStr}&adults=${adults}&children=${children}&include_partial=true`,
      )

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("API response:", data)

      // Set available rooms
      setAvailableRooms(data.fully_available || [])

      // Set partially available rooms
      setPartiallyAvailableRooms(data.partially_available || [])

      // If we have recommendations, show them
      if (data.recommendations) {
        setAvailabilityError(data.recommendations.message)
      }

      // If we already have a selected room from URL params, check if it's available
      if (selectedRoom) {
        const isFullyAvailable = (data.fully_available || []).some((room: any) => room.id === selectedRoom.id)
        const isPartiallyAvailable = (data.partially_available || []).some((room: any) => room.id === selectedRoom.id)

        if (!isFullyAvailable && !isPartiallyAvailable) {
          setSelectedRoom(null)
          toast({
            title: "Camera non disponibile",
            description: "La camera selezionata non è disponibile per le date scelte.",
            variant: "destructive",
          })
        } else if (isFullyAvailable) {
          // Update the selected room with availability info
          const updatedRoom = (data.fully_available || []).find((room: any) => room.id === selectedRoom.id)
          setSelectedRoom(updatedRoom)
          setTotalPrice(updatedRoom.total_price)
        } else if (isPartiallyAvailable) {
          // Update the selected room with partial availability info
          const updatedRoom = (data.partially_available || []).find((room: any) => room.id === selectedRoom.id)
          setSelectedRoom(updatedRoom)
          setTotalPrice(updatedRoom.total_price)

          // Show warning about partial availability
          toast({
            title: "Disponibilità parziale",
            description: `La camera selezionata è disponibile solo per ${updatedRoom.available_dates.length} giorni su ${updatedRoom.available_dates.length + updatedRoom.unavailable_dates.length}.`,
            variant: "warning",
          })
        }
      }

      // Move to next step if we have dates
      if (currentStep === 1 && startDate && endDate) {
        setCurrentStep(2)
      }

      // If no rooms are available, try to fix availability issues
      if ((data.fully_available || []).length === 0) {
        // Call the MiMo agent to fix availability issues
        await fetch(`/api/mimo/run?agent=availability&auto_fix=true&start_date=${checkInStr}&end_date=${checkOutStr}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("MiMo agent response:", data)

            // If issues were fixed, check availability again
            if (data.results?.availability_fix?.fixed > 0) {
              toast({
                title: "Disponibilità aggiornata",
                description: `Abbiamo risolto ${data.results.availability_fix.fixed} problemi di disponibilità. Ricontrolliamo...`,
              })

              // Check availability again after a short delay
              setTimeout(() => checkAvailability(startDate, endDate), 1000)
            }
          })
          .catch((error) => {
            console.error("Error running MiMo agent:", error)
          })
      }
    } catch (error) {
      console.error("Error checking availability:", error)
      setAvailabilityError("Si è verificato un errore durante la verifica della disponibilità.")
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la verifica della disponibilità.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  // Handle room selection
  const handleSelectRoom = (room: any) => {
    setSelectedRoom(room)
    setTotalPrice(room.total_price)
    setCurrentStep(4) // Move to guest details
  }

  // Handle guest details change
  const handleGuestDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGuestDetails((prev) => ({ ...prev, [name]: value }))
  }

  // Validate guest details
  const validateGuestDetails = () => {
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
      toast({
        title: "Dati mancanti",
        description: "Per favore, compila tutti i campi obbligatori.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!validateGuestDetails() || !checkIn || !checkOut || !selectedRoom || !supabase) return

    setIsLoading(true)

    try {
      // Create a new booking number
      const newBookingNumber = generateBookingNumber()
      setBookingNumber(newBookingNumber)

      // First, create or get the guest
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .select("*")
        .eq("email", guestDetails.email)
        .maybeSingle()

      if (guestError) throw guestError

      let guestId

      if (guest) {
        // Update existing guest
        const { error: updateError } = await supabase
          .from("guests")
          .update({
            first_name: guestDetails.firstName,
            last_name: guestDetails.lastName,
            phone: guestDetails.phone,
            address: guestDetails.address || null,
            city: guestDetails.city || null,
            country: guestDetails.country || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", guest.id)

        if (updateError) throw updateError

        guestId = guest.id
      } else {
        // Create new guest
        const { data: newGuest, error: createError } = await supabase
          .from("guests")
          .insert({
            first_name: guestDetails.firstName,
            last_name: guestDetails.lastName,
            email: guestDetails.email,
            phone: guestDetails.phone,
            address: guestDetails.address || null,
            city: guestDetails.city || null,
            country: guestDetails.country || null,
          })
          .select()

        if (createError) throw createError

        guestId = newGuest[0].id
      }

      // Create the booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        booking_number: newBookingNumber,
        room_id: selectedRoom.id,
        guest_id: guestId,
        check_in: format(checkIn, "yyyy-MM-dd"),
        check_out: format(checkOut, "yyyy-MM-dd"),
        adults: Number.parseInt(adults),
        children: Number.parseInt(children),
        total_price: totalPrice,
        status: "confirmed",
        notes: guestDetails.specialRequests || null,
      })

      if (bookingError) throw bookingError

      // Update availability for the room during the booking period
      const startDate = new Date(checkIn)
      const endDate = new Date(checkOut)
      const dates = []
      let currentDate = startDate

      while (currentDate < endDate) {
        dates.push(format(currentDate, "yyyy-MM-dd"))
        currentDate = addDays(currentDate, 1)
      }

      // For each date, update or create availability record
      for (const date of dates) {
        const { data: existingAvailability, error: checkError } = await supabase
          .from("availability")
          .select("*")
          .eq("room_id", selectedRoom.id)
          .eq("date", date)
          .maybeSingle()

        if (checkError) throw checkError

        if (existingAvailability) {
          // Update existing record
          const { error: updateError } = await supabase
            .from("availability")
            .update({ is_available: false })
            .eq("id", existingAvailability.id)

          if (updateError) throw updateError
        } else {
          // Create new record
          const { error: insertError } = await supabase.from("availability").insert({
            room_id: selectedRoom.id,
            date,
            is_available: false,
            price: selectedRoom.base_price, // Use base price or any specific price logic
          })

          if (insertError) throw insertError
        }
      }

      // Try to send WhatsApp notification via CallMeBot
      try {
        const message = `Nuova prenotazione: ${newBookingNumber}. ${guestDetails.firstName} ${guestDetails.lastName} ha prenotato ${selectedRoom.name} dal ${format(checkIn, "dd/MM/yyyy")} al ${format(checkOut, "dd/MM/yyyy")}. Totale: ${formatCurrency(totalPrice)}.`

        // Get admin phone from settings
        const { data: settings } = await supabase.from("settings").select("value").eq("key", "contact_info").single()

        if (settings?.value?.whatsapp) {
          const phone = settings.value.whatsapp.replace(/\+/g, "").replace(/\s/g, "")

          // Send WhatsApp notification using CallMeBot
          await fetch(
            `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=123456`,
          ).catch((error) => console.error("Error sending WhatsApp notification:", error))
        }
      } catch (error) {
        console.error("Error sending notification:", error)
        // Don't throw here, as this is not critical for the booking process
      }

      setBookingConfirmed(true)
      setCurrentStep(5) // Move to confirmation step
    } catch (error) {
      console.error("Error confirming booking:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conferma della prenotazione.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!checkIn || !checkOut) {
        toast({
          title: "Date mancanti",
          description: "Per favore, seleziona le date di check-in e check-out.",
          variant: "destructive",
        })
        return
      }
      checkAvailability(checkIn, checkOut)
    } else if (currentStep === 2) {
      if (!selectedRoom) {
        toast({
          title: "Camera non selezionata",
          description: "Per favore, seleziona una camera per continuare.",
          variant: "destructive",
        })
        return
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      setCurrentStep(4)
    } else if (currentStep === 4) {
      if (validateGuestDetails()) {
        handleConfirmBooking()
      }
    }
  }

  // Render step 1: Dates and guests
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="check-in">Check-in</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="check-in" variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? (
                  format(checkIn, "PPP", { locale: language === "it" ? it : enUS })
                ) : (
                  <span>Seleziona data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                initialFocus
                disabled={(date) => date < new Date()}
                locale={language === "it" ? it : enUS}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="check-out">Check-out</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="check-out" variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? (
                  format(checkOut, "PPP", { locale: language === "it" ? it : enUS })
                ) : (
                  <span>Seleziona data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                initialFocus
                disabled={(date) => !checkIn || date <= checkIn || date < new Date()}
                locale={language === "it" ? it : enUS}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="adults">Adulti</Label>
          <Select value={adults} onValueChange={setAdults}>
            <SelectTrigger id="adults">
              <SelectValue placeholder="Adulti" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "adulto" : "adulti"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="children">Bambini</Label>
          <Select value={children} onValueChange={setChildren}>
            <SelectTrigger id="children">
              <SelectValue placeholder="Bambini" />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "bambino" : "bambini"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  // Render step 2: Available rooms
  const renderStep2 = () => (
    <div className="space-y-6">
      {isCheckingAvailability ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Verifica disponibilità in corso...</p>
        </div>
      ) : (
        <>
          {availabilityError && (
            <Alert variant="warning" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Attenzione</AlertTitle>
              <AlertDescription>{availabilityError}</AlertDescription>
            </Alert>
          )}

          {availableRooms.length > 0 || partiallyAvailableRooms.length > 0 ? (
            <>
              {availableRooms.length > 0 && partiallyAvailableRooms.length > 0 && (
                <Tabs defaultValue="available" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">Camere Disponibili ({availableRooms.length})</TabsTrigger>
                    <TabsTrigger value="partial">Disponibilità Parziale ({partiallyAvailableRooms.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="available" className="mt-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      {availableRooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          selectedRoom={selectedRoom}
                          onSelect={handleSelectRoom}
                          checkIn={checkIn}
                          checkOut={checkOut}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="partial" className="mt-4">
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Disponibilità Parziale</AlertTitle>
                      <AlertDescription>
                        Queste camere sono disponibili solo per parte del periodo selezionato. Selezionando una di
                        queste camere, la prenotazione sarà limitata ai giorni disponibili.
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-6">
                      {partiallyAvailableRooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          selectedRoom={selectedRoom}
                          onSelect={handleSelectRoom}
                          checkIn={checkIn}
                          checkOut={checkOut}
                          isPartial
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {availableRooms.length > 0 && partiallyAvailableRooms.length === 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {availableRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      selectedRoom={selectedRoom}
                      onSelect={handleSelectRoom}
                      checkIn={checkIn}
                      checkOut={checkOut}
                    />
                  ))}
                </div>
              )}

              {availableRooms.length === 0 && partiallyAvailableRooms.length > 0 && (
                <>
                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Solo Disponibilità Parziale</AlertTitle>
                    <AlertDescription>
                      Non ci sono camere disponibili per l'intero periodo selezionato. Di seguito trovi le camere
                      disponibili per parte del periodo.
                    </AlertDescription>
                  </Alert>

                  <div className="grid md:grid-cols-2 gap-6">
                    {partiallyAvailableRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        selectedRoom={selectedRoom}
                        onSelect={handleSelectRoom}
                        checkIn={checkIn}
                        checkOut={checkOut}
                        isPartial
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg mb-4">Nessuna camera disponibile per le date selezionate.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setCurrentStep(1)}>Cambia Date</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Invia una richiesta di contatto
                    const message = `Richiesta disponibilità per ${adults} adulti e ${children} bambini dal ${checkIn ? format(checkIn, "dd/MM/yyyy") : "?"} al ${checkOut ? format(checkOut, "dd/MM/yyyy") : "?"}`

                    // Redirect to contact page with prefilled message
                    router.push(`/contacts?message=${encodeURIComponent(message)}`)
                  }}
                >
                  Contattaci per Assistenza
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  // Room Card Component
  const RoomCard = ({ room, selectedRoom, onSelect, checkIn, checkOut, isPartial = false }) => (
    <Card
      key={room.id}
      className={`${selectedRoom?.id === room.id ? "border-primary" : ""} ${isPartial ? "border-amber-300" : ""}`}
    >
      <div className="relative h-48">
        <Image
          src={room.images[0] || "/placeholder.svg?height=200&width=400"}
          alt={room.name}
          fill
          className="object-cover rounded-t-lg"
        />
        {isPartial && (
          <Badge className="absolute top-2 right-2 bg-amber-500">Disponibilità {room.availability_percentage}%</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
        <CardDescription>{room.short_description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm mb-4">
          <span>Max: {room.max_guests} ospiti</span>
          <span>{room.size_sqm} m²</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(room.amenities) &&
            room.amenities.slice(0, 3).map((amenity: string, index: number) => (
              <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                {amenity}
              </span>
            ))}
        </div>
        <div className="text-xl font-bold text-primary">
          {formatCurrency(room.total_price)}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            / {calculateNights(checkIn!, checkOut!)} notti
          </span>
        </div>

        {isPartial && (
          <div className="mt-2 text-sm text-amber-600">
            <p>
              Disponibile solo per {room.available_dates.length} giorni su{" "}
              {room.available_dates.length + room.unavailable_dates.length}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onSelect(room)}
          variant={selectedRoom?.id === room.id ? "default" : "outline"}
        >
          {selectedRoom?.id === room.id ? "Camera Selezionata" : "Seleziona"}
        </Button>
      </CardFooter>
    </Card>
  )

  // Render step 3: Room details
  const renderStep3 = () => (
    <div className="space-y-6">
      {selectedRoom && (
        <Card>
          <div className="grid md:grid-cols-2">
            <div className="relative h-full min-h-[200px]">
              <Image
                src={selectedRoom.images[0] || "/placeholder.svg?height=400&width=600"}
                alt={selectedRoom.name}
                fill
                className="object-cover rounded-l-lg"
              />
              {selectedRoom.availability_status === "partially_available" && (
                <Badge className="absolute top-4 right-4 bg-amber-500">Disponibilità Parziale</Badge>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{selectedRoom.name}</h3>
              <p className="text-muted-foreground mb-4">{selectedRoom.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span>Max {selectedRoom.max_guests} ospiti</span>
                </div>
                <div className="flex items-center">
                  <span>{selectedRoom.size_sqm} m²</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Servizi:</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedRoom.amenities) &&
                    selectedRoom.amenities.map((amenity: string, index: number) => (
                      <span key={index} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {amenity}
                      </span>
                    ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Dettagli prenotazione:</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Check-in:</strong> {checkIn && formatDate(checkIn)}
                  </p>
                  <p>
                    <strong>Check-out:</strong> {checkOut && formatDate(checkOut)}
                  </p>
                  <p>
                    <strong>Ospiti:</strong> {adults} adulti, {children} bambini
                  </p>
                  <p>
                    <strong>Notti:</strong> {checkIn && checkOut && calculateNights(checkIn, checkOut)}
                  </p>
                </div>
              </div>

              {selectedRoom.availability_status === "partially_available" && (
                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Disponibilità Parziale</AlertTitle>
                  <AlertDescription>
                    Questa camera è disponibile solo per {selectedRoom.available_dates.length} giorni su{" "}
                    {selectedRoom.available_dates.length + selectedRoom.unavailable_dates.length}. La prenotazione sarà
                    limitata ai giorni disponibili.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-xl font-bold text-primary">{formatCurrency(selectedRoom.total_price)}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  // Render step 4: Guest details
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={guestDetails.firstName}
            onChange={handleGuestDetailsChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome *</Label>
          <Input
            id="lastName"
            name="lastName"
            value={guestDetails.lastName}
            onChange={handleGuestDetailsChange}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={guestDetails.email}
            onChange={handleGuestDetailsChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono *</Label>
          <Input id="phone" name="phone" value={guestDetails.phone} onChange={handleGuestDetailsChange} required />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="address">Indirizzo</Label>
          <Input id="address" name="address" value={guestDetails.address} onChange={handleGuestDetailsChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Città</Label>
          <Input id="city" name="city" value={guestDetails.city} onChange={handleGuestDetailsChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Paese</Label>
        <Input id="country" name="country" value={guestDetails.country} onChange={handleGuestDetailsChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequests">Richieste Speciali</Label>
        <Textarea
          id="specialRequests"
          name="specialRequests"
          value={guestDetails.specialRequests}
          onChange={handleGuestDetailsChange}
          placeholder="Eventuali richieste speciali o note per il tuo soggiorno"
        />
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-bold mb-2">Riepilogo Prenotazione</h3>
        {selectedRoom && (
          <div className="space-y-2 text-sm">
            <p>
              <strong>Camera:</strong> {selectedRoom.name}
            </p>
            <p>
              <strong>Check-in:</strong> {checkIn && formatDate(checkIn)}
            </p>
            <p>
              <strong>Check-out:</strong> {checkOut && formatDate(checkOut)}
            </p>
            <p>
              <strong>Ospiti:</strong> {adults} adulti, {children} bambini
            </p>
            <p>
              <strong>Notti:</strong> {checkIn && checkOut && calculateNights(checkIn, checkOut)}
            </p>

            {selectedRoom.availability_status === "partially_available" && (
              <p className="text-amber-600">
                <strong>Nota:</strong> Disponibilità parziale ({selectedRoom.available_dates.length} giorni su{" "}
                {selectedRoom.available_dates.length + selectedRoom.unavailable_dates.length})
              </p>
            )}

            <Separator className="my-2" />
            <p className="text-lg font-bold">
              <strong>Totale:</strong> {formatCurrency(selectedRoom.total_price)}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // Render step 5: Booking confirmation
  const renderStep5 = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Check className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">Prenotazione Confermata!</h2>
      <p className="text-muted-foreground">
        Grazie per aver scelto Leonardo&apos;s Rooms. La tua prenotazione è stata confermata.
      </p>

      <div className="bg-muted p-6 rounded-lg max-w-md mx-auto text-left">
        <h3 className="font-bold mb-4">Dettagli Prenotazione</h3>
        <div className="space-y-2">
          <p>
            <strong>Numero Prenotazione:</strong> {bookingNumber}
          </p>
          <p>
            <strong>Camera:</strong> {selectedRoom?.name}
          </p>
          <p>
            <strong>Check-in:</strong> {checkIn && formatDate(checkIn)}
          </p>
          <p>
            <strong>Check-out:</strong> {checkOut && formatDate(checkOut)}
          </p>
          <p>
            <strong>Ospiti:</strong> {adults} adulti, {children} bambini
          </p>
          <p>
            <strong>Totale:</strong> {formatCurrency(totalPrice)}
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <p>
          Abbiamo inviato una email di conferma a <strong>{guestDetails.email}</strong>.
        </p>
        <p>
          Per qualsiasi domanda o modifica alla tua prenotazione, contattaci al{" "}
          <a href="tel:+39360923824" className="text-primary">
            +39 360923824
          </a>{" "}
          o via email a{" "}
          <a href="mailto:info@leonardosrooms.it" className="text-primary">
            info@leonardosrooms.it
          </a>
          .
        </p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Torna alla Home
        </Button>
      </div>
    </div>
  )

  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      default:
        return null
    }
  }

  // If Supabase client is not initialized yet, show loading
  if (!supabase) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Caricamento in corso...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Steps currentStep={currentStep} className="mb-8">
        <Step title="Date e Ospiti" />
        <Step title="Disponibilità" />
        <Step title="Camera" />
        <Step title="Dati Ospite" />
        <Step title="Conferma" />
      </Steps>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1
              ? "Date e Ospiti"
              : currentStep === 2
                ? "Disponibilità"
                : currentStep === 3
                  ? "Dettagli Camera"
                  : currentStep === 4
                    ? "Dati Ospite"
                    : "Conferma Prenotazione"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1
              ? "Seleziona le date del tuo soggiorno e il numero di ospiti"
              : currentStep === 2
                ? "Scegli la camera più adatta alle tue esigenze"
                : currentStep === 3
                  ? "Verifica i dettagli della camera selezionata"
                  : currentStep === 4
                    ? "Inserisci i tuoi dati per completare la prenotazione"
                    : "La tua prenotazione è stata confermata"}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderCurrentStep()}</CardContent>
        {currentStep < 5 && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep === 1 || isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>
            <Button
              onClick={goToNextStep}
              disabled={
                isLoading || (currentStep === 2 && !selectedRoom) || (currentStep === 1 && (!checkIn || !checkOut))
              }
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {currentStep === 4 ? "Conferma in corso..." : "Caricamento..."}
                </div>
              ) : currentStep === 4 ? (
                "Conferma Prenotazione"
              ) : (
                <>
                  Avanti
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
