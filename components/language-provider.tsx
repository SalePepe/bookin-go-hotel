"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "it" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, section?: string) => string
  translations: Record<string, Record<string, string>>
  setTranslations: (translations: Record<string, Record<string, string>>) => void
}

const defaultTranslations = {
  common: {
    home: { it: "Home", en: "Home" },
    rooms: { it: "Camere", en: "Rooms" },
    services: { it: "Servizi", en: "Services" },
    attractions: { it: "Attrazioni", en: "Attractions" },
    contacts: { it: "Contatti", en: "Contacts" },
    book_now: { it: "Prenota Ora", en: "Book Now" },
    check_availability: { it: "Verifica Disponibilità", en: "Check Availability" },
    check_in: { it: "Check-in", en: "Check-in" },
    check_out: { it: "Check-out", en: "Check-out" },
    guests: { it: "Ospiti", en: "Guests" },
    adults: { it: "Adulti", en: "Adults" },
    children: { it: "Bambini", en: "Children" },
    search: { it: "Cerca", en: "Search" },
    price: { it: "Prezzo", en: "Price" },
    night: { it: "notte", en: "night" },
    view_details: { it: "Vedi Dettagli", en: "View Details" },
    book_this_room: { it: "Prenota questa camera", en: "Book this room" },
    contact_us: { it: "Contattaci", en: "Contact Us" },
    send_message: { it: "Invia Messaggio", en: "Send Message" },
    name: { it: "Nome", en: "Name" },
    email: { it: "Email", en: "Email" },
    phone: { it: "Telefono", en: "Phone" },
    message: { it: "Messaggio", en: "Message" },
    address: { it: "Indirizzo", en: "Address" },
    follow_us: { it: "Seguici", en: "Follow Us" },
    all_rights_reserved: { it: "Tutti i diritti riservati", en: "All rights reserved" },
    privacy_policy: { it: "Privacy Policy", en: "Privacy Policy" },
    terms_of_service: { it: "Termini di Servizio", en: "Terms of Service" },
  },
  home: {
    welcome: {
      it: "Benvenuti a Leonardo's Rooms",
      en: "Welcome to Leonardo's Rooms",
    },
    subtitle: {
      it: "Il tuo soggiorno perfetto a Pontassieve, vicino a Firenze",
      en: "Your perfect stay in Pontassieve, near Florence",
    },
    discover_rooms: {
      it: "Scopri le nostre camere",
      en: "Discover our rooms",
    },
    about_us: {
      it: "Chi Siamo",
      en: "About Us",
    },
    about_description: {
      it: "Leonardo's Rooms è un accogliente B&B situato a Pontassieve, in posizione strategica per visitare Firenze e la Toscana. Offriamo camere confortevoli e un servizio personalizzato per rendere il vostro soggiorno indimenticabile.",
      en: "Leonardo's Rooms is a cozy B&B located in Pontassieve, in a strategic position to visit Florence and Tuscany. We offer comfortable rooms and personalized service to make your stay unforgettable.",
    },
    our_services: {
      it: "I Nostri Servizi",
      en: "Our Services",
    },
    nearby_attractions: {
      it: "Attrazioni Nelle Vicinanze",
      en: "Nearby Attractions",
    },
  },
  rooms: {
    our_rooms: {
      it: "Le Nostre Camere",
      en: "Our Rooms",
    },
    room_description: {
      it: "Scopri le nostre camere confortevoli e accoglienti",
      en: "Discover our comfortable and welcoming rooms",
    },
    amenities: {
      it: "Servizi in Camera",
      en: "Room Amenities",
    },
    max_guests: {
      it: "Ospiti max",
      en: "Max guests",
    },
    room_size: {
      it: "Dimensione",
      en: "Size",
    },
    beds: {
      it: "Letti",
      en: "Beds",
    },
  },
  booking: {
    booking_title: {
      it: "Prenota il tuo soggiorno",
      en: "Book your stay",
    },
    step1: {
      it: "Date e ospiti",
      en: "Dates and guests",
    },
    step2: {
      it: "Verifica disponibilità",
      en: "Check availability",
    },
    step3: {
      it: "Scelta camera",
      en: "Room selection",
    },
    step4: {
      it: "Dati cliente",
      en: "Guest details",
    },
    step5: {
      it: "Conferma",
      en: "Confirmation",
    },
    next: {
      it: "Avanti",
      en: "Next",
    },
    back: {
      it: "Indietro",
      en: "Back",
    },
    confirm_booking: {
      it: "Conferma Prenotazione",
      en: "Confirm Booking",
    },
    booking_confirmed: {
      it: "Prenotazione Confermata!",
      en: "Booking Confirmed!",
    },
    booking_details: {
      it: "Dettagli Prenotazione",
      en: "Booking Details",
    },
    personal_info: {
      it: "Informazioni Personali",
      en: "Personal Information",
    },
    first_name: {
      it: "Nome",
      en: "First Name",
    },
    last_name: {
      it: "Cognome",
      en: "Last Name",
    },
    email: {
      it: "Email",
      en: "Email",
    },
    phone: {
      it: "Telefono",
      en: "Phone",
    },
    address: {
      it: "Indirizzo",
      en: "Address",
    },
    city: {
      it: "Città",
      en: "City",
    },
    country: {
      it: "Paese",
      en: "Country",
    },
    special_requests: {
      it: "Richieste Speciali",
      en: "Special Requests",
    },
  },
  admin: {
    dashboard: {
      it: "Dashboard",
      en: "Dashboard",
    },
    rooms: {
      it: "Camere",
      en: "Rooms",
    },
    availability: {
      it: "Disponibilità",
      en: "Availability",
    },
    bookings: {
      it: "Prenotazioni",
      en: "Bookings",
    },
    guests: {
      it: "Ospiti",
      en: "Guests",
    },
    content: {
      it: "Contenuti",
      en: "Content",
    },
    settings: {
      it: "Impostazioni",
      en: "Settings",
    },
    logout: {
      it: "Logout",
      en: "Logout",
    },
    add_new: {
      it: "Aggiungi Nuovo",
      en: "Add New",
    },
    edit: {
      it: "Modifica",
      en: "Edit",
    },
    delete: {
      it: "Elimina",
      en: "Delete",
    },
    save: {
      it: "Salva",
      en: "Save",
    },
    cancel: {
      it: "Annulla",
      en: "Cancel",
    },
    confirm: {
      it: "Conferma",
      en: "Confirm",
    },
    actions: {
      it: "Azioni",
      en: "Actions",
    },
    status: {
      it: "Stato",
      en: "Status",
    },
    date: {
      it: "Data",
      en: "Date",
    },
    total: {
      it: "Totale",
      en: "Total",
    },
    occupancy_rate: {
      it: "Tasso di Occupazione",
      en: "Occupancy Rate",
    },
    revenue: {
      it: "Ricavi",
      en: "Revenue",
    },
    upcoming_bookings: {
      it: "Prenotazioni in Arrivo",
      en: "Upcoming Bookings",
    },
    recent_bookings: {
      it: "Prenotazioni Recenti",
      en: "Recent Bookings",
    },
    mimo_agents: {
      it: "Agenti MiMo",
      en: "MiMo Agents",
    },
    run_agent: {
      it: "Esegui Agente",
      en: "Run Agent",
    },
    agent_logs: {
      it: "Log Agenti",
      en: "Agent Logs",
    },
  },
}

const flattenTranslations = (translations: Record<string, Record<string, { it: string; en: string }>>) => {
  const flattened: Record<string, Record<string, string>> = {}

  Object.entries(translations).forEach(([section, keys]) => {
    flattened[section] = {}
    Object.entries(keys).forEach(([key, value]) => {
      flattened[section][key] = value
    })
  })

  return flattened
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("it")
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language.split("-")[0]
    if (browserLang === "en") {
      setLanguage("en")
    }

    // Initialize with default translations
    setTranslations(defaultTranslations)

    // Load translations from localStorage if available
    const storedLang = localStorage.getItem("language")
    if (storedLang === "it" || storedLang === "en") {
      setLanguage(storedLang)
    }
  }, [])

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string, section = "common") => {
    if (!translations[section] || !translations[section][key]) {
      console.warn(`Translation missing: ${section}.${key}`)
      return key
    }

    return translations[section][key][language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations, setTranslations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
