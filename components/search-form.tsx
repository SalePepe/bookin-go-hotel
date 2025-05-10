"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { it, enUS } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/language-provider"

export function SearchForm() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [adults, setAdults] = useState("2")
  const [children, setChildren] = useState("0")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkIn || !checkOut) {
      return
    }

    const searchParams = new URLSearchParams()
    searchParams.set("checkIn", format(checkIn, "yyyy-MM-dd"))
    searchParams.set("checkOut", format(checkOut, "yyyy-MM-dd"))
    searchParams.set("adults", adults)
    searchParams.set("children", children)

    router.push(`/booking?${searchParams.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-white dark:bg-gray-800 text-black dark:text-white"
            >
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
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-white dark:bg-gray-800 text-black dark:text-white"
            >
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

      <div>
        <Select value={adults} onValueChange={setAdults}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-black dark:text-white">
            <SelectValue placeholder={t("adults")} />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? t("adult", "common") : t("adults")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select value={children} onValueChange={setChildren}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-800 text-black dark:text-white">
            <SelectValue placeholder={t("children")} />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 4].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? t("child", "common") : t("children")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-4">
        <Button type="submit" className="w-full bg-primary text-primary-foreground">
          {t("check_availability")}
        </Button>
      </div>
    </form>
  )
}
