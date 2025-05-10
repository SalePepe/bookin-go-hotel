"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, Send, AlertCircle } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"

export function WhatsAppNotifications() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendMessage = async () => {
    if (!phoneNumber || !message) {
      setResult({
        success: false,
        message: "Per favore, inserisci un numero di telefono e un messaggio.",
      })
      return
    }

    setIsSending(true)
    setResult(null)

    try {
      // Formatta il numero di telefono (rimuovi spazi, +, ecc.)
      const formattedPhone = phoneNumber.replace(/\+/g, "").replace(/\s/g, "")

      // Invia il messaggio tramite CallMeBot
      const response = await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodeURIComponent(message)}&apikey=123456`,
      )

      if (!response.ok) {
        throw new Error(`Errore nell'invio del messaggio: ${response.status} ${response.statusText}`)
      }

      // Registra la notifica nel database
      const supabase = createClientSupabaseClient()
      await supabase.from("notifications").insert({
        type: "whatsapp",
        recipient: phoneNumber,
        content: message,
        status: "sent",
      })

      setResult({
        success: true,
        message: "Messaggio WhatsApp inviato con successo!",
      })

      // Resetta il form
      setMessage("")
    } catch (error) {
      console.error("Errore nell'invio del messaggio WhatsApp:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Si è verificato un errore durante l'invio del messaggio.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invia Notifica WhatsApp</CardTitle>
        <CardDescription>
          Invia un messaggio WhatsApp a un ospite o a un amministratore tramite CallMeBot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{result.success ? "Successo" : "Errore"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="phone">Numero di Telefono</Label>
          <Input
            id="phone"
            placeholder="+39 123 456 7890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Inserisci il numero completo con prefisso internazionale (es. +39 per l'Italia)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Messaggio</Label>
          <Textarea
            id="message"
            placeholder="Scrivi il tuo messaggio qui..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSendMessage} disabled={isSending || !phoneNumber || !message} className="w-full">
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Invio in corso...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Invia Messaggio WhatsApp
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
