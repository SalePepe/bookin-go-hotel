"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, AlertTriangle, X, RefreshCw, Database, Calendar, Home, Users } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"

export function SystemStatus() {
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<any>({})
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkSystemStatus = async () => {
    setIsLoading(true)

    try {
      const supabase = createClientSupabaseClient()

      // Verifica connessione al database
      const dbStatus = await checkDatabaseStatus(supabase)

      // Verifica tabelle
      const tablesStatus = await checkTablesStatus(supabase)

      // Verifica dati
      const dataStatus = await checkDataStatus(supabase)

      // Verifica agenti MiMo
      const mimoStatus = await checkMimoStatus(supabase)

      setStatus({
        database: dbStatus,
        tables: tablesStatus,
        data: dataStatus,
        mimo: mimoStatus,
        overall:
          dbStatus.status === "ok" &&
          tablesStatus.every((t) => t.status === "ok") &&
          Object.values(dataStatus).every((s: any) => s.status === "ok") &&
          mimoStatus.status === "ok",
      })

      setLastChecked(new Date())
    } catch (error) {
      console.error("Errore durante il controllo dello stato del sistema:", error)
      setStatus({
        error: "Si è verificato un errore durante il controllo dello stato del sistema",
        overall: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Controlla lo stato del database
  const checkDatabaseStatus = async (supabase: any) => {
    try {
      const { data, error } = await supabase.from("rooms").select("count()", { count: "exact" }).limit(1)

      if (error) throw error

      return {
        status: "ok",
        message: "Connessione al database stabilita",
      }
    } catch (error) {
      console.error("Errore durante il controllo del database:", error)
      return {
        status: "error",
        message: "Impossibile connettersi al database",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Controlla lo stato delle tabelle
  const checkTablesStatus = async (supabase: any) => {
    const tables = [
      "rooms",
      "availability",
      "guests",
      "bookings",
      "services",
      "attractions",
      "content",
      "settings",
      "mimo_logs",
    ]

    const results = []

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("count()", { count: "exact" })

        if (error) throw error

        results.push({
          table,
          status: "ok",
          count: data[0].count,
        })
      } catch (error) {
        console.error(`Errore durante il controllo della tabella ${table}:`, error)
        results.push({
          table,
          status: "error",
          message: `Errore nella tabella ${table}`,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return results
  }

  // Controlla lo stato dei dati
  const checkDataStatus = async (supabase: any) => {
    const results: any = {}

    // Controlla camere
    try {
      const { data: rooms, error: roomsError } = await supabase.from("rooms").select("count()", { count: "exact" })

      if (roomsError) throw roomsError

      results.rooms = {
        status: "ok",
        count: rooms[0].count,
        message: rooms[0].count > 0 ? `${rooms[0].count} camere trovate` : "Nessuna camera trovata",
      }
    } catch (error) {
      results.rooms = {
        status: "error",
        message: "Errore durante il controllo delle camere",
        error: error instanceof Error ? error.message : String(error),
      }
    }

    // Controlla disponibilità
    try {
      const { data: availability, error: availabilityError } = await supabase
        .from("availability")
        .select("count()", { count: "exact" })

      if (availabilityError) throw availabilityError

      results.availability = {
        status: "ok",
        count: availability[0].count,
        message:
          availability[0].count > 0
            ? `${availability[0].count} record di disponibilità trovati`
            : "Nessun record di disponibilità trovato",
      }
    } catch (error) {
      results.availability = {
        status: "error",
        message: "Errore durante il controllo della disponibilità",
        error: error instanceof Error ? error.message : String(error),
      }
    }

    // Controlla prenotazioni
    try {
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("count()", { count: "exact" })

      if (bookingsError) throw bookingsError

      results.bookings = {
        status: "ok",
        count: bookings[0].count,
        message: bookings[0].count > 0 ? `${bookings[0].count} prenotazioni trovate` : "Nessuna prenotazione trovata",
      }
    } catch (error) {
      results.bookings = {
        status: "error",
        message: "Errore durante il controllo delle prenotazioni",
        error: error instanceof Error ? error.message : String(error),
      }
    }

    return results
  }

  // Controlla lo stato degli agenti MiMo
  const checkMimoStatus = async (supabase: any) => {
    try {
      const { data: logs, error: logsError } = await supabase
        .from("mimo_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)

      if (logsError) throw logsError

      if (logs && logs.length > 0) {
        const lastLog = logs[0]
        const lastRunTime = new Date(lastLog.created_at)
        const now = new Date()
        const hoursSinceLastRun = (now.getTime() - lastRunTime.getTime()) / (1000 * 60 * 60)

        return {
          status: "ok",
          lastRun: lastRunTime,
          agent: lastLog.agent,
          action: lastLog.action,
          status: lastLog.status,
          hoursSinceLastRun,
          message: `Ultimo agente eseguito: ${lastLog.agent} (${lastLog.action}) - ${lastLog.status}`,
        }
      } else {
        return {
          status: "warning",
          message: "Nessun log di agenti MiMo trovato",
        }
      }
    } catch (error) {
      console.error("Errore durante il controllo degli agenti MiMo:", error)
      return {
        status: "error",
        message: "Errore durante il controllo degli agenti MiMo",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // Esegui il controllo al caricamento del componente
  useEffect(() => {
    checkSystemStatus()
  }, [])

  // Funzione per eseguire il seeder
  const runSeeder = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/seed")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Database popolato con successo",
          description: `Aggiunti: ${data.stats.rooms} camere, ${data.stats.availability} record di disponibilità`,
        })
      } else {
        toast({
          title: "Errore",
          description: data.error || "Si è verificato un errore durante il popolamento del database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Errore durante l'esecuzione del seeder:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'esecuzione del seeder",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      // Ricontrolla lo stato dopo un breve ritardo
      setTimeout(() => checkSystemStatus(), 1000)
    }
  }

  // Funzione per eseguire gli agenti MiMo
  const runMimoAgents = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/mimo/run?agent=all&auto_fix=true")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Agenti MiMo eseguiti con successo",
          description: "Gli agenti hanno analizzato e corretto i dati del sistema",
        })
      } else {
        toast({
          title: "Errore",
          description: data.error || "Si è verificato un errore durante l'esecuzione degli agenti MiMo",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Errore durante l'esecuzione degli agenti MiMo:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'esecuzione degli agenti MiMo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      // Ricontrolla lo stato dopo un breve ritardo
      setTimeout(() => checkSystemStatus(), 1000)
    }
  }

  const toast = {
    title: (title: string) => console.log(title),
    description: (description: string) => console.log(description),
    variant: (variant: string) => console.log(variant),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Stato del Sistema
          <Button variant="outline" size="sm" onClick={checkSystemStatus} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Aggiorna
          </Button>
        </CardTitle>
        <CardDescription>
          {lastChecked ? `Ultimo controllo: ${lastChecked.toLocaleString()}` : "Controllo in corso..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Controllo in corso...</span>
          </div>
        ) : status.error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant={status.overall ? "success" : "destructive"} className="mr-2">
                  {status.overall ? "Operativo" : "Problemi Rilevati"}
                </Badge>
                <span>Stato generale del sistema</span>
              </div>
              <div>
                {status.overall ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Database
              </h3>
              <div className="pl-6 text-sm">
                <div className="flex items-center justify-between">
                  <span>Connessione</span>
                  <StatusIcon status={status.database?.status} />
                </div>
                <p className="text-muted-foreground text-xs mt-1">{status.database?.message}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Camere e Disponibilità
              </h3>
              <div className="pl-6 text-sm">
                <div className="flex items-center justify-between">
                  <span>Camere</span>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{status.data?.rooms?.count || 0}</span>
                    <StatusIcon status={status.data?.rooms?.status} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Disponibilità</span>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{status.data?.availability?.count || 0}</span>
                    <StatusIcon status={status.data?.availability?.status} />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Prenotazioni
              </h3>
              <div className="pl-6 text-sm">
                <div className="flex items-center justify-between">
                  <span>Prenotazioni</span>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{status.data?.bookings?.count || 0}</span>
                    <StatusIcon status={status.data?.bookings?.status} />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Agenti MiMo
              </h3>
              <div className="pl-6 text-sm">
                <div className="flex items-center justify-between">
                  <span>Stato</span>
                  <StatusIcon status={status.mimo?.status} />
                </div>
                <p className="text-muted-foreground text-xs mt-1">{status.mimo?.message}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={runSeeder} disabled={isLoading}>
          <Database className="h-4 w-4 mr-2" />
          Popola Database
        </Button>
        <Button onClick={runMimoAgents} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Esegui Agenti MiMo
        </Button>
      </CardFooter>
    </Card>
  )
}

// Componente per mostrare lo stato con icona
function StatusIcon({ status }: { status?: string }) {
  if (!status) return null

  switch (status) {
    case "ok":
      return <Check className="h-4 w-4 text-green-500" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case "error":
      return <X className="h-4 w-4 text-red-500" />
    default:
      return null
  }
}
