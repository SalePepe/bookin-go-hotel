"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { createClientSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

interface RoomsManagerProps {
  initialRooms: any[]
}

export function RoomsManager({ initialRooms }: RoomsManagerProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  const handleEditRoom = (room: any) => {
    setSelectedRoom(room)
    setIsDialogOpen(true)
  }

  const handleCreateRoom = () => {
    setSelectedRoom({
      name: "",
      short_description: "",
      description: "",
      base_price: 0,
      max_guests: 2,
      size_sqm: 0,
      beds: "",
      amenities: [],
      images: ["/placeholder.svg?height=200&width=400"],
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRoom) return

    setIsLoading(true)

    try {
      if (selectedRoom.id) {
        // Update existing room
        const { error } = await supabase
          .from("rooms")
          .update({
            name: selectedRoom.name,
            short_description: selectedRoom.short_description,
            description: selectedRoom.description,
            base_price: selectedRoom.base_price,
            max_guests: selectedRoom.max_guests,
            size_sqm: selectedRoom.size_sqm,
            beds: selectedRoom.beds,
            amenities: selectedRoom.amenities,
            images: selectedRoom.images,
            is_active: selectedRoom.is_active,
          })
          .eq("id", selectedRoom.id)

        if (error) throw error

        // Update local state
        setRooms(rooms.map((room) => (room.id === selectedRoom.id ? selectedRoom : room)))

        toast({
          title: "Camera aggiornata",
          description: "La camera è stata aggiornata con successo.",
        })
      } else {
        // Create new room
        const { data, error } = await supabase
          .from("rooms")
          .insert({
            name: selectedRoom.name,
            short_description: selectedRoom.short_description,
            description: selectedRoom.description,
            base_price: selectedRoom.base_price,
            max_guests: selectedRoom.max_guests,
            size_sqm: selectedRoom.size_sqm,
            beds: selectedRoom.beds,
            amenities: selectedRoom.amenities,
            images: selectedRoom.images,
            is_active: selectedRoom.is_active,
          })
          .select()

        if (error) throw error

        // Update local state
        setRooms([...rooms, data[0]])

        toast({
          title: "Camera creata",
          description: "La camera è stata creata con successo.",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving room:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della camera.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa camera?")) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("rooms").delete().eq("id", roomId)

      if (error) throw error

      // Update local state
      setRooms(rooms.filter((room) => room.id !== roomId))

      toast({
        title: "Camera eliminata",
        description: "La camera è stata eliminata con successo.",
      })
    } catch (error) {
      console.error("Error deleting room:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione della camera.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRoomStatus = async (roomId: string, isActive: boolean) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("rooms").update({ is_active: !isActive }).eq("id", roomId)

      if (error) throw error

      // Update local state
      setRooms(rooms.map((room) => (room.id === roomId ? { ...room, is_active: !isActive } : room)))

      toast({
        title: isActive ? "Camera disattivata" : "Camera attivata",
        description: `La camera è stata ${isActive ? "disattivata" : "attivata"} con successo.`,
      })
    } catch (error) {
      console.error("Error toggling room status:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la modifica dello stato della camera.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSelectedRoom({ ...selectedRoom, [name]: value })
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSelectedRoom({ ...selectedRoom, [name]: Number.parseFloat(value) })
  }

  const handleSwitchChange = (checked: boolean) => {
    setSelectedRoom({ ...selectedRoom, is_active: checked })
  }

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amenitiesString = e.target.value
    const amenitiesArray = amenitiesString
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    setSelectedRoom({ ...selectedRoom, amenities: amenitiesArray })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Camere</h1>
        <Button onClick={handleCreateRoom}>Aggiungi Camera</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tutte</TabsTrigger>
          <TabsTrigger value="active">Attive</TabsTrigger>
          <TabsTrigger value="inactive">Inattive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {rooms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onEdit={() => handleEditRoom(room)}
                  onDelete={() => handleDeleteRoom(room.id)}
                  onToggleStatus={() => handleToggleRoomStatus(room.id, room.is_active)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nessuna camera disponibile</p>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {rooms.filter((room) => room.is_active).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms
                .filter((room) => room.is_active)
                .map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={() => handleEditRoom(room)}
                    onDelete={() => handleDeleteRoom(room.id)}
                    onToggleStatus={() => handleToggleRoomStatus(room.id, room.is_active)}
                  />
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nessuna camera attiva</p>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {rooms.filter((room) => !room.is_active).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms
                .filter((room) => !room.is_active)
                .map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={() => handleEditRoom(room)}
                    onDelete={() => handleDeleteRoom(room.id)}
                    onToggleStatus={() => handleToggleRoomStatus(room.id, room.is_active)}
                  />
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nessuna camera inattiva</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRoom?.id ? "Modifica Camera" : "Aggiungi Camera"}</DialogTitle>
            <DialogDescription>
              {selectedRoom?.id ? "Modifica i dettagli della camera esistente" : "Aggiungi una nuova camera al sistema"}
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <form onSubmit={handleSaveRoom}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Camera</Label>
                    <Input id="name" name="name" value={selectedRoom.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Prezzo Base</Label>
                    <Input
                      id="base_price"
                      name="base_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={selectedRoom.base_price}
                      onChange={handleNumberInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Descrizione Breve</Label>
                  <Input
                    id="short_description"
                    name="short_description"
                    value={selectedRoom.short_description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrizione Completa</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={selectedRoom.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_guests">Ospiti Max</Label>
                    <Input
                      id="max_guests"
                      name="max_guests"
                      type="number"
                      min="1"
                      value={selectedRoom.max_guests}
                      onChange={handleNumberInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size_sqm">Dimensione (m²)</Label>
                    <Input
                      id="size_sqm"
                      name="size_sqm"
                      type="number"
                      min="1"
                      value={selectedRoom.size_sqm}
                      onChange={handleNumberInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beds">Letti</Label>
                    <Input id="beds" name="beds" value={selectedRoom.beds} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Servizi (separati da virgola)</Label>
                  <Input
                    id="amenities"
                    name="amenities"
                    value={Array.isArray(selectedRoom.amenities) ? selectedRoom.amenities.join(", ") : ""}
                    onChange={handleAmenitiesChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Immagini (URL separati da virgola)</Label>
                  <Input
                    id="images"
                    name="images"
                    value={Array.isArray(selectedRoom.images) ? selectedRoom.images.join(", ") : ""}
                    onChange={(e) => {
                      const imagesString = e.target.value
                      const imagesArray = imagesString
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                      setSelectedRoom({ ...selectedRoom, images: imagesArray })
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="is_active" checked={selectedRoom.is_active} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="is_active">Camera Attiva</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvataggio..." : "Salva"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface RoomCardProps {
  room: any
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
}

function RoomCard({ room, onEdit, onDelete, onToggleStatus }: RoomCardProps) {
  return (
    <Card className={!room.is_active ? "opacity-70" : undefined}>
      <div className="relative h-48">
        <Image
          src={room.images[0] || "/placeholder.svg?height=200&width=400"}
          alt={room.name}
          fill
          className="object-cover rounded-t-lg"
        />
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
          {formatCurrency(room.base_price)}
        </Badge>
        {!room.is_active && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">Inattiva</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
        <CardDescription>{room.short_description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-sm mb-4">
          <div>
            <span className="font-medium">Ospiti:</span> {room.max_guests}
          </div>
          <div>
            <span className="font-medium">Dimensione:</span> {room.size_sqm} m²
          </div>
          <div>
            <span className="font-medium">Letti:</span> {room.beds}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(room.amenities) &&
            room.amenities.slice(0, 3).map((amenity: string, index: number) => (
              <Badge key={index} variant="outline">
                {amenity}
              </Badge>
            ))}
          {Array.isArray(room.amenities) && room.amenities.length > 3 && (
            <Badge variant="outline">+{room.amenities.length - 3}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onToggleStatus}>
          {room.is_active ? "Disattiva" : "Attiva"}
        </Button>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Modifica
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Elimina
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
