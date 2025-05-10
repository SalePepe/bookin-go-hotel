"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { it, enUS } from "date-fns/locale"
import { CalendarIcon, Users, Maximize, Bed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useLanguage } from "@/components/language-provider"
import { formatCurrency } from "@/lib/utils"

interface RoomDetailProps {
  room: any
}

export function RoomDetail({ room }: RoomDetailProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [adults, setAdults] = useState(room.max_guests > 1 ? "2" : "1")
  const [children, setChildren] = useState("0")
  const [selectedImage, setSelectedImage] = useState(room.images[0] || "/placeholder.svg?height=400&width=600")

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      return
    }

    const searchParams = new URLSearchParams()
    searchParams.set("roomId", room.id)
    searchParams.set("checkIn", format(checkIn, "yyyy-MM-dd"))
    searchParams.set("checkOut", format(checkOut, "yyyy-MM-dd"))
    searchParams.set("adults", adults)
    searchParams.set("children", children)

    router.push(`/booking?${searchParams.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{room.name}</h1>
      <p className="text-lg text-muted-foreground mb-8">{room.short_description}</p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image src={selectedImage || "/placeholder.svg"} alt={room.name} fill className="object-cover" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {room.images.map((image: string, index: number) => (
              <div
                key={index}
                className={`relative h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                  selectedImage === image ? "border-primary" : "border-transparent"
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${room.name} - Immagine ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Descrizione</h2>
            <p className="text-muted-foreground">{room.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Users className="h-6 w-6 mb-2 text-primary" />
              <span className="text-sm font-medium">Max {room.max_guests} ospiti</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Maximize className="h-6 w-6 mb-2 text-primary" />
              <span className="text-sm font-medium">{room.size_sqm} m²</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Bed className="h-6 w-6 mb-2 text-primary" />
              <span className="text-sm font-medium">{room.beds}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Prenota</h2>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(room.base_price)}{" "}
                <span className="text-sm font-normal text-muted-foreground">/ notte</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? (
                        format(checkIn, "PPP", { locale: language === "it" ? it : enUS })
                      ) : (
                        <span>{t("check_in")}</span>
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

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? (
                        format(checkOut, "PPP", { locale: language === "it" ? it : enUS })
                      ) : (
                        <span>{t("check_out")}</span>
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

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Select value={adults} onValueChange={setAdults}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("adults")} />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(room.max_guests)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1} {i === 0 ? t("adult", "common") : t("adults")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={children} onValueChange={setChildren}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("children")} />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(Math.max(0, room.max_guests - Number.parseInt(adults)))].map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i} {i === 1 ? t("child", "common") : t("children")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleBookNow} disabled={!checkIn || !checkOut}>
              {t("book_now")}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Servizi in Camera</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.isArray(room.amenities) &&
            room.amenities.map((amenity: string, index: number) => (
              <Badge key={index} variant="outline" className="py-2 px-4 text-center justify-center">
                {amenity}
              </Badge>
            ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Altre Camere</h2>
        <Carousel>
          <CarouselContent>
            {/* Qui andrebbero altre camere, ma per ora mettiamo dei placeholder */}
            {[...Array(4)].map((_, i) => (
              <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=200&width=400"
                      alt="Altra camera"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Button variant="secondary">Vedi Camera</Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}
