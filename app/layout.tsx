import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/components/language-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s | Leonardo's Rooms",
    default: "Leonardo's Rooms - B&B a Pontassieve, Firenze",
  },
  description:
    "Bed & Breakfast a Pontassieve, posizione strategica per Firenze. Prenotazione diretta, risposte rapide via WhatsApp.",
  keywords: ["bed and breakfast", "pontassieve", "firenze", "leonardo's rooms", "alloggio", "hotel"],
  authors: [{ name: "Leonardo's Rooms" }],
  creator: "Leonardo's Rooms",
  publisher: "Leonardo's Rooms",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://www.leonardosrooms.it",
    title: "Leonardo's Rooms - B&B a Pontassieve, Firenze",
    description:
      "Bed & Breakfast a Pontassieve, posizione strategica per Firenze. Prenotazione diretta, risposte rapide via WhatsApp.",
    siteName: "Leonardo's Rooms",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              name: "Leonardo's Rooms",
              description: "Bed & Breakfast a Pontassieve, posizione strategica per Firenze",
              url: "https://www.leonardosrooms.it",
              telephone: "+39 360923824",
              email: "info@leonardosrooms.it",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Via Piave, 7",
                addressLocality: "Pontassieve",
                addressRegion: "FI",
                postalCode: "50065",
                addressCountry: "IT",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 43.8049,
                longitude: 11.4416,
              },
              priceRange: "€€",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                opens: "00:00",
                closes: "23:59",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
