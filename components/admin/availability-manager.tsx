"use client"

import { useState, useEffect } from "react"
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { it } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createClientSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { Loader2, CalendarIcon } from "lucide-react"

interface AvailabilityManagerProps {
  initialRooms: { id: string; name: string }[]
  bookingSettings: any
}

export function AvailabilityManager({ initialRooms, bookingSettings }: AvailabilityManagerProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(initialRooms[0]?.id || null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [month, setMonth] = useState<Date>(new Date())
  const [availability, setAvailability] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editMode, setEditMode] = useState<"single" | "range" | "bulk">("single")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date | undefined }>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [bulkDays, setBulkDays] = useState<{ [key: string]: boolean }>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  })
  const [editValues, setEditValues] = useState({
    isAvailable: true,
    price: "",
  })
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  // Carica la disponibilità per il mese e la camera selezionati
  useEffect(() => {
    if (!selectedRoom) return

    const fetchAvailability = async () => {
      setIsLoading(true)
      try {
        const startDate = format(startOfMonth(month), "yyyy-MM-dd")
        const endDate = format(endOfMonth(month), "yyyy-MM-dd")

        const { data: roomData } = await supabase.from("rooms").select("base_price").eq("id", selectedRoom).single()

        const basePrice = roomData?.base_price || 0

        const { data, error } = await supabase
          .from("availability")
          .select("*")
          .eq("room_id", selectedRoom)
          .gte("date", startDate)
          .lte("date", endDate)

        if (error) throw error

        // Crea un array con tutti i giorni del mese
        const daysInMonth = eachDayOfInterval({
          start: startOfMonth(month),
          end: endOfMonth(month),
        })

        // Mappa la disponibilità per ogni giorno
        const availabilityMap = daysInMonth.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const existingData = data?.find((item) => item.date === dateStr)

          return {
            date: dateStr,
            is_available: existingData ? existingData.is_available : true,
            price: existingData ? existingData.price : basePrice,
            id: existingData?.id,
            room_id: selectedRoom,
          }
        })

        setAvailability(availabilityMap)
      } catch (error) {
        console.error("Error fetching availability:", error)
        toast({
          title: "Errore",
          description: "Impossibile caricare la disponibilità",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [selectedRoom, month, supabase, toast])

  // Aggiorna i valori di modifica quando viene selezionata una data
  useEffect(() => {
    if (editMode === "single" && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const dayData = availability.find((day) => day.date === dateStr)

      if (dayData) {
        setEditValues({
          isAvailable: dayData.is_available,
          price: dayData.price.toString(),
        })
      }
    }
  }, [selectedDate, availability, editMode])

  // Gestisce il cambio della camera selezionata
  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId)
  }

  // Gestisce il cambio della data selezionata
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  // Gestisce il cambio del range di date
  const handleDateRangeSelect = (range: { from: Date; to: Date | undefined }) => {
    setDateRange(range)
  }

  // Gestisce il cambio dei giorni della settimana per la modifica in blocco
  const handleBulkDayToggle = (day: string) => {
    setBulkDays({
      ...bulkDays,
      [day]: !bulkDays[day],
    })
  }

  // Salva le modifiche alla disponibilità
  const handleSaveAvailability = async () => {
    setIsUpdating(true)

    try {
      let updates: any[] = []

      if (editMode === "single") {
        // Modifica singola data
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const dayData = availability.find((day) => day.date === dateStr)

        updates = [
          {
            id: dayData?.id,
            room_id: selectedRoom,
            date: dateStr,
            is_available: editValues.isAvailable,
            price: Number.parseFloat(editValues.price) || 0,
          },
        ]
      } else if (editMode === "range" && dateRange.from && dateRange.to) {
        // Modifica range di date
        const daysInRange = eachDayOfInterval({
          start: dateRange.from,
          end: dateRange.to,
        })

        updates = daysInRange.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const dayData = availability.find((item) => item.date === dateStr)

          return {
            id: dayData?.id,
            room_id: selectedRoom,
            date: dateStr,
            is_available: editValues.isAvailable,
            price: Number.parseFloat(editValues.price) || 0,
          }
        })
      } else if (editMode === "bulk") {
        // Modifica in blocco per giorni della settimana
        const daysInMonth = eachDayOfInterval({
          start: startOfMonth(month),
          end: endOfMonth(month),
        })

        const selectedDayIndices = Object.entries(bulkDays)
          .filter(([_, isSelected]) => isSelected)
          .map(([day]) => {
            const dayMap: { [key: string]: number } = {
              monday: 1,
              tuesday: 2,
              wednesday: 3,
              thursday: 4,
              friday: 5,
              saturday: 6,
              sunday: 0,
            }
            return dayMap[day]
          })

        updates = daysInMonth
          .filter((day) => selectedDayIndices.includes(day.getDay()))
          .map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const dayData = availability.find((item) => item.date === dateStr)

            return {
              id: dayData?.id,
              room_id: selectedRoom,
              date: dateStr,
              is_available: editValues.isAvailable,
              price: Number.parseFloat(editValues.price) || 0,
            }
          })
      }

      // Rimuovi gli ID nulli per le nuove voci
      const cleanUpdates = updates.map((update) => {
        if (!update.id) {
          const { id, ...rest } = update
          return rest
        }
        return update
      })

      const { error } = await supabase.from("availability").upsert(cleanUpdates)

      if (error) throw error

      toast({
        title: "Disponibilità aggiornata",
        description: `Aggiornate ${updates.length} date con successo`,
      })

      // Ricarica la disponibilità
      const startDate = format(startOfMonth(month), "yyyy-MM-dd")
      const endDate = format(endOfMonth(month), "yyyy-MM-dd")

      const { data, error: fetchError } = await supabase
        .from("availability")
        .select("*")
        .eq("room_id", selectedRoom)
        .gte("date", startDate)
        .lte("date", endDate)

      if (fetchError) throw fetchError

      // Aggiorna lo stato locale
      const updatedAvailability = [...availability]
      updates.forEach((update) => {
        const index = updatedAvailability.findIndex((item) => item.date === update.date)
        if (index !== -1) {
          updatedAvailability[index] = {
            ...updatedAvailability[index],
            is_available: update.is_available,
            price: update.price,
          }
        }
      })

      setAvailability(updatedAvailability)
    } catch (error) {
      console.error("Error updating availability:", error)
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la disponibilità",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Funzione per ottenere lo stile del giorno nel calendario
  const getDayStyle = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dayData = availability.find((day) => day.date === dateStr)

    if (!dayData) return {}

    if (!dayData.is_available) {
      return {
        backgroundColor: "rgb(239, 68, 68, 0.1)",
        color: "rgb(239, 68, 68)",
        borderRadius: "0.25rem",
      }
    }

    return {
      backgroundColor: "rgb(34, 197, 94, 0.1)",
      color: "rgb(34, 197, 94)",
      borderRadius: "0.25rem",
    }
  }

  // Funzione per ottenere il contenuto del giorno nel calendario
  const getDayContent = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dayData = availability.find((day) => day.date === dateStr)

    if (!dayData) return null

    return <div className="text-[8px] font-medium mt-1">{formatCurrency(dayData.price)}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Disponibilità</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Calendario Disponibilità</CardTitle>
              <Select value={selectedRoom || ""} onValueChange={handleRoomChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Seleziona camera" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Visualizza e gestisci la disponibilità delle camere. Verde = disponibile, Rosso = non disponibile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={month}
                onMonthChange={setMonth}
                className="rounded-md border"
                locale={it}
                modifiers={{
                  selected: [selectedDate],
                }}
                modifiersStyles={{
                  selected: {
                    backgroundColor: "rgb(var(--primary))",
                    color: "white",
                  },
                }}
                components={{
                  DayContent: ({ date }) => (
                    <>
                      {date.getDate()}
                      {getDayContent(date)}
                    </>
                  ),
                }}
                styles={{
                  day: (date) => getDayStyle(date),
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modifica Disponibilità</CardTitle>
            <CardDescription>Modifica la disponibilità e i prezzi per date singole o intervalli</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" onValueChange={(value) => setEditMode(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="single">Singola Data</TabsTrigger>
                <TabsTrigger value="range">Intervallo</TabsTrigger>
                <TabsTrigger value="bulk">In Blocco</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Selezionata</Label>
                  <div className="flex items-center p-2 border rounded-md">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{format(selectedDate, "dd MMMM yyyy", { locale: it })}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="range" className="space-y-4">
                <div className="space-y-2">
                  <Label>Intervallo di Date</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center p-2 border rounded-md">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Da: {format(dateRange.from, "dd MMMM yyyy", { locale: it })}</span>
                    </div>
                    <div className="flex items-center p-2 border rounded-md">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>
                        A: {dateRange.to ? format(dateRange.to, "dd MMMM yyyy", { locale: it }) : "Seleziona"}
                      </span>
                    </div>
                  </div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeSelect as any}
                    className="rounded-md border"
                    locale={it}
                  />
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <div className="space-y-2">
                  <Label>Giorni della Settimana</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(bulkDays).map(([day, isSelected]) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Switch checked={isSelected} onCheckedChange={() => handleBulkDayToggle(day)} />
                        <Label>
                          {
                            {
                              monday: "Lunedì",
                              tuesday: "Martedì",
                              wednesday: "Mercoledì",
                              thursday: "Giovedì",
                              friday: "Venerdì",
                              saturday: "Sabato",
                              sunday: "Domenica",
                            }[day]
                          }
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Le modifiche verranno applicate a tutti i giorni selezionati nel mese corrente.
                  </p>
                </div>
              </TabsContent>

              <div className="space-y-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editValues.isAvailable}
                    onCheckedChange={(checked) => setEditValues({ ...editValues, isAvailable: checked })}
                  />
                  <Label>Disponibile</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Prezzo</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editValues.price}
                    onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                  />
                </div>
              </div>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveAvailability} disabled={isUpdating} className="w-full">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva Modifiche"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
