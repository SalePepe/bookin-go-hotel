"use client"

import { useState } from "react"
import { addDays, format } from "date-fns"
import { it } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClientSupabaseClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { Check, Clock, AlertTriangle, Activity, CalendarIcon, ArrowRight, ArrowDown, ArrowUp, User } from "lucide-react"

interface AgentsDashboardProps {
  initialRooms: { id: string; name: string }[]
  initialLogs: any[]
}

export function AgentsDashboard({ initialRooms, initialLogs }: AgentsDashboardProps) {
  const [activeTab, setActiveTab] = useState("pricing")
  const [isLoading, setIsLoading] = useState(false)
  const [rooms, setRooms] = useState(initialRooms)
  const [logs, setLogs] = useState(initialLogs)
  const [selectedRoom, setSelectedRoom] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 30),
  })
  const [threshold, setThreshold] = useState(5) // Soglia del 5% per modifiche di prezzo
  const [agentResults, setAgentResults] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  // Esegui l'agente
  const runAgent = async (agent: string, action: string) => {
    setIsLoading(true)
    try {
      const params = {
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        roomId: selectedRoom === "all" ? "" : selectedRoom,
        threshold: threshold,
      }

      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent,
          action,
          params,
        }),
      })

      if (!response.ok) {
        throw new Error("Errore nell'esecuzione dell'agente")
      }

      const data = await response.json()
      setAgentResults(data.result)

      toast({
        title: "Agente eseguito con successo",
        description: `L'agente ${agent} ha completato l'operazione ${action}`,
      })

      // Aggiorna i log
      const { data: newLogs } = await supabase
        .from("mimo_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (newLogs) {
        setLogs(newLogs)
      }
    } catch (error) {
      console.error("Error running agent:", error)
      toast({
        title: "Errore",
        description: "Impossibile eseguire l'agente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Applica i suggerimenti
  const applySuggestions = async (agent: string) => {
    setIsLoading(true)
    try {
      let params = {}

      if (agent === "pricing" && agentResults) {
        params = {
          recommendations: agentResults,
          threshold: threshold,
        }
      } else if (agent === "availability" && agentResults?.alerts) {
        params = {
          alerts: agentResults.alerts,
        }
      }

      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent,
          action: agent === "pricing" ? "apply" : "fix",
          params,
        }),
      })

      if (!response.ok) {
        throw new Error("Errore nell'applicazione dei suggerimenti")
      }

      const data = await response.json()

      toast({
        title: "Suggerimenti applicati",
        description: `I suggerimenti dell'agente ${agent} sono stati applicati con successo`,
      })

      // Resetta i risultati
      setAgentResults(null)

      // Aggiorna i log
      const { data: newLogs } = await supabase
        .from("mimo_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (newLogs) {
        setLogs(newLogs)
      }
    } catch (error) {
      console.error("Error applying suggestions:", error)
      toast({
        title: "Errore",
        description: "Impossibile applicare i suggerimenti",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderPricingResults = () => {
    if (!agentResults || !Array.isArray(agentResults)) return null

    return (
      <div className="space-y-4 mt-4">
        <h3 className="text-lg font-medium">Risultati analisi prezzi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentResults.slice(0, 6).map((result: any, idx: number) => (
            <Card key={idx} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 bg-muted/30">
                <CardTitle className="text-sm">
                  {format(new Date(result.date), "dd MMMM yyyy", { locale: it })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Prezzo attuale:</span>
                  <span className="font-medium">{formatCurrency(result.originalPrice)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Prezzo suggerito:</span>
                  <span className="font-medium">{formatCurrency(result.adjustedPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Variazione:</span>
                  <Badge
                    variant={result.adjustedPrice > result.originalPrice ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {result.adjustedPrice > result.originalPrice ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {Math.abs(((result.adjustedPrice - result.originalPrice) / result.originalPrice) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {agentResults.length > 6 && (
          <div className="text-center text-sm text-muted-foreground">
            + {agentResults.length - 6} altri risultati non mostrati
          </div>
        )}
        <Button onClick={() => applySuggestions("pricing")} disabled={isLoading} className="w-full">
          Applica tutti i suggerimenti di prezzo
        </Button>
      </div>
    )
  }

  const renderAvailabilityResults = () => {
    if (!agentResults || !agentResults.alerts) return null

    return (
      <div className="space-y-4 mt-4">
        <h3 className="text-lg font-medium">Problemi di disponibilità rilevati</h3>
        <div className="space-y-2">
          {agentResults.alerts.slice(0, 5).map((alert: any, idx: number) => (
            <Alert key={idx} variant={alert.severity === "high" ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.issue}</AlertTitle>
              <AlertDescription className="text-sm">
                <div>
                  Camera: {alert.roomName} | Data: {format(new Date(alert.date), "dd/MM/yyyy")}
                </div>
                <div className="mt-1">{alert.recommendation}</div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
        {agentResults.alerts.length > 5 && (
          <div className="text-center text-sm text-muted-foreground">
            + {agentResults.alerts.length - 5} altri problemi non mostrati
          </div>
        )}
        {agentResults.alerts.length > 0 && (
          <Button onClick={() => applySuggestions("availability")} disabled={isLoading} className="w-full">
            Correggi automaticamente i problemi
          </Button>
        )}
        <div className="bg-muted p-4 rounded-lg text-sm">
          <h4 className="font-medium mb-2">Statistiche</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>Date totali analizzate: {agentResults.stats.totalDates}</div>
            <div>Date disponibili: {agentResults.stats.availableDates}</div>
            <div>Date non disponibili: {agentResults.stats.unavailableDates}</div>
            <div>Periodi di bassa disponibilità: {agentResults.stats.lowAvailabilityPeriods}</div>
            <div>Pattern inusuali: {agentResults.stats.unusualPatterns}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">MiMo - Agenti Intelligenti</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Configurazione Agenti</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pricing" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pricing">Agente Pricing</TabsTrigger>
                <TabsTrigger value="availability">Agente Disponibilità</TabsTrigger>
              </TabsList>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Seleziona Camera</h3>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona camera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le camere</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Periodo di Analisi</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{format(dateRange.from, "dd/MM/yyyy")}</span>
                    <ArrowRight size={14} />
                    <span>{format(dateRange.to, "dd/MM/yyyy")}</span>
                  </div>
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({
                          from: range.from,
                          to: range.to,
                        })
                      }
                    }}
                    numberOfMonths={2}
                    className="border rounded-md"
                  />
                </div>

                {activeTab === "pricing" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Soglia di modifica prezzi ({threshold}%)</h3>
                      <span className="text-sm text-muted-foreground">Applica solo se la differenza è maggiore</span>
                    </div>
                    <Slider
                      value={[threshold]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => setThreshold(value[0])}
                    />
                  </div>
                )}

                <div className="pt-4">
                  <Button onClick={() => runAgent(activeTab, "analyze")} disabled={isLoading} className="w-full">
                    {isLoading ? "Analisi in corso..." : "Esegui Analisi"}
                  </Button>
                </div>

                {activeTab === "pricing" && renderPricingResults()}
                {activeTab === "availability" && renderAvailabilityResults()}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ultimi Log</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-auto">
            <div className="space-y-2">
              {logs.map((log, idx) => (
                <div key={idx} className="border rounded-md p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium flex items-center">
                      {log.agent === "pricingAgent" && <Activity className="h-4 w-4 mr-1 text-blue-500" />}
                      {log.agent === "availabilityAgent" && <CalendarIcon className="h-4 w-4 mr-1 text-green-500" />}
                      {log.agent === "admin" && <User className="h-4 w-4 mr-1 text-purple-500" />}
                      {log.agent}
                    </div>
                    <Badge
                      variant={
                        log.status === "completed" ? "outline" : log.status === "error" ? "destructive" : "secondary"
                      }
                    >
                      {log.status === "completed" && <Check className="h-3 w-3 mr-1" />}
                      {log.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {log.status === "error" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {log.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">{log.action}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-muted-foreground py-10">Nessun log disponibile</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
