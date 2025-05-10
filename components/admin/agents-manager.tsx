"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, DollarSign, CheckCircle, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AgentsManagerProps {
  initialLogs: any[]
  rooms: { id: string; name: string }[]
}

export function AgentsManager({ initialLogs, rooms }: AgentsManagerProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [isLoading, setIsLoading] = useState(false)
  const [activeAgent, setActiveAgent] = useState<"pricing" | "availability">("pricing")
  const [pricingParams, setPricingParams] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
    roomId: "",
    threshold: "5",
  })
  const [availabilityParams, setAvailabilityParams] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
    roomId: "",
  })
  const [pricingResults, setPricingResults] = useState<any[]>([])
  const [availabilityResults, setAvailabilityResults] = useState<any>({ alerts: [], stats: {}, log: [] })
  const { toast } = useToast()

  const handlePricingParamChange = (name: string, value: string) => {
    setPricingParams({ ...pricingParams, [name]: value })
  }

  const handleAvailabilityParamChange = (name: string, value: string) => {
    setAvailabilityParams({ ...availabilityParams, [name]: value })
  }

  const runPricingAnalysis = async () => {
    setIsLoading(true)
    setPricingResults([])

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent: "pricing",
          action: "analyze",
          params: {
            startDate: pricingParams.startDate,
            endDate: pricingParams.endDate,
            roomId: pricingParams.roomId || undefined,
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Errore durante l'analisi dei prezzi")
      }

      setPricingResults(data.data)

      // Aggiorna i log
      fetchLogs()

      toast({
        title: "Analisi completata",
        description: `Analizzati ${data.data.length} prezzi con successo.`,
      })
    } catch (error) {
      console.error("Error running pricing analysis:", error)
      toast({
        title: "Errore",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyPricingRecommendations = async () => {
    if (pricingResults.length === 0) {
      toast({
        title: "Nessun risultato",
        description: "Esegui prima l'analisi dei prezzi.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent: "pricing",
          action: "apply",
          params: {
            recommendations: pricingResults,
            threshold: Number.parseFloat(pricingParams.threshold),
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Errore durante l'applicazione delle raccomandazioni")
      }

      // Aggiorna i log
      fetchLogs()

      toast({
        title: "Raccomandazioni applicate",
        description: `Aggiornati ${data.data.applied} prezzi con successo.`,
      })
    } catch (error) {
      console.error("Error applying pricing recommendations:", error)
      toast({
        title: "Errore",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runAvailabilityAnalysis = async () => {
    setIsLoading(true)
    setAvailabilityResults({ alerts: [], stats: {}, log: [] })

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent: "availability",
          action: "analyze",
          params: {
            startDate: availabilityParams.startDate,
            endDate: availabilityParams.endDate,
            roomId: availabilityParams.roomId || undefined,
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Errore durante l'analisi della disponibilità")
      }

      setAvailabilityResults(data.data)

      // Aggiorna i log
      fetchLogs()

      toast({
        title: "Analisi completata",
        description: `Trovati ${data.data.alerts.length} avvisi.`,
      })
    } catch (error) {
      console.error("Error running availability analysis:", error)
      toast({
        title: "Errore",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fixAvailabilityIssues = async () => {
    if (availabilityResults.alerts.length === 0) {
      toast({
        title: "Nessun avviso",
        description: "Esegui prima l'analisi della disponibilità.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent: "availability",
          action: "fix",
          params: {
            alerts: availabilityResults.alerts,
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Errore durante la correzione dei problemi")
      }

      // Aggiorna i log
      fetchLogs()

      toast({
        title: "Problemi risolti",
        description: `Corretti ${data.data.fixed} problemi con successo.`,
      })
    } catch (error) {
      console.error("Error fixing availability issues:", error)
      toast({
        title: "Errore",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/agents/logs")
      const data = await response.json()

      if (data.success) {
        setLogs(data.data)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agenti MiMo</h1>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agenti</TabsTrigger>
          <TabsTrigger value="logs">Log ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <Tabs defaultValue="pricing" onValueChange={(value) => setActiveAgent(value as any)}>
            <TabsList>
              <TabsTrigger value="pricing">
                <DollarSign className="h-4 w-4 mr-2" />
                Pricing Agent
              </TabsTrigger>
              <TabsTrigger value="availability">
                <Calendar className="h-4 w-4 mr-2" />
                Availability Agent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analisi dei Prezzi</CardTitle>
                  <CardDescription>
                    Analizza e ottimizza i prezzi in base alla stagionalità, domanda e altri fattori
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Data Inizio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={pricingParams.startDate}
                        onChange={(e) => handlePricingParamChange("startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Data Fine</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={pricingParams.endDate}
                        onChange={(e) => handlePricingParamChange("endDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roomId">Camera (opzionale)</Label>
                      <Select
                        value={pricingParams.roomId}
                        onValueChange={(value) => handlePricingParamChange("roomId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tutte le camere" />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="threshold">
                      Soglia di Applicazione (%) - Applica solo se la differenza è maggiore di:
                    </Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="0"
                      max="50"
                      value={pricingParams.threshold}
                      onChange={(e) => handlePricingParamChange("threshold", e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={runPricingAnalysis} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisi in corso...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Analizza Prezzi
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={applyPricingRecommendations}
                    disabled={isLoading || pricingResults.length === 0}
                    variant="default"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applicazione in corso...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Applica Raccomandazioni
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {pricingResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risultati Analisi Prezzi</CardTitle>
                    <CardDescription>{pricingResults.length} prezzi analizzati</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Data</th>
                          <th className="text-left py-2">Camera</th>
                          <th className="text-right py-2">Prezzo Originale</th>
                          <th className="text-right py-2">Prezzo Ottimizzato</th>
                          <th className="text-right py-2">Differenza</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingResults.map((result, index) => {
                          const room = rooms.find((r) => r.id === result.roomId)
                          const priceDiff = result.adjustedPrice - result.originalPrice
                          const priceDiffPercent = (priceDiff / result.originalPrice) * 100

                          return (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="py-2">{result.date}</td>
                              <td className="py-2">{room?.name || "Camera sconosciuta"}</td>
                              <td className="text-right py-2">{formatCurrency(result.originalPrice)}</td>
                              <td className="text-right py-2">{formatCurrency(result.adjustedPrice)}</td>
                              <td className="text-right py-2">
                                <span
                                  className={priceDiff > 0 ? "text-green-600" : priceDiff < 0 ? "text-red-600" : ""}
                                >
                                  {priceDiff > 0 ? "+" : ""}
                                  {formatCurrency(priceDiff)} ({priceDiffPercent.toFixed(1)}%)
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="availability" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analisi della Disponibilità</CardTitle>
                  <CardDescription>Identifica problemi e incongruenze nella disponibilità delle camere</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avStartDate">Data Inizio</Label>
                      <Input
                        id="avStartDate"
                        type="date"
                        value={availabilityParams.startDate}
                        onChange={(e) => handleAvailabilityParamChange("startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avEndDate">Data Fine</Label>
                      <Input
                        id="avEndDate"
                        type="date"
                        value={availabilityParams.endDate}
                        onChange={(e) => handleAvailabilityParamChange("endDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="avRoomId">Camera (opzionale)</Label>
                      <Select
                        value={availabilityParams.roomId}
                        onValueChange={(value) => handleAvailabilityParamChange("roomId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tutte le camere" />
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
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={runAvailabilityAnalysis} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisi in corso...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Analizza Disponibilità
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={fixAvailabilityIssues}
                    disabled={isLoading || availabilityResults.alerts.length === 0}
                    variant="default"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Correzione in corso...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Correggi Problemi
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {availabilityResults.alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risultati Analisi Disponibilità</CardTitle>
                    <CardDescription>{availabilityResults.alerts.length} problemi trovati</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[400px] overflow-y-auto">
                    <div className="space-y-4">
                      {availabilityResults.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="bg-muted p-3 rounded-md">
                            <div className="text-sm text-muted-foreground">Date Totali</div>
                            <div className="text-2xl font-bold">{availabilityResults.stats.totalDates || 0}</div>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <div className="text-sm text-muted-foreground">Disponibili</div>
                            <div className="text-2xl font-bold text-green-600">
                              {availabilityResults.stats.availableDates || 0}
                            </div>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <div className="text-sm text-muted-foreground">Non Disponibili</div>
                            <div className="text-2xl font-bold text-red-600">
                              {availabilityResults.stats.unavailableDates || 0}
                            </div>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <div className="text-sm text-muted-foreground">Periodi Bassa Disp.</div>
                            <div className="text-2xl font-bold text-amber-600">
                              {availabilityResults.stats.lowAvailabilityPeriods || 0}
                            </div>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            <div className="text-sm text-muted-foreground">Pattern Inusuali</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {availabilityResults.stats.unusualPatterns || 0}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {availabilityResults.alerts.map((alert: any, index: number) => (
                          <div key={index} className="border rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {alert.roomName} - {alert.date}
                                </div>
                                <div className="text-sm text-muted-foreground">{alert.issue}</div>
                              </div>
                              <Badge
                                variant={
                                  alert.severity === "high"
                                    ? "destructive"
                                    : alert.severity === "medium"
                                      ? "default"
                                      : "outline"
                                }
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Raccomandazione:</span> {alert.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Log degli Agenti</CardTitle>
              <CardDescription>Storico delle esecuzioni degli agenti MiMo</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <Accordion type="single" collapsible className="space-y-2">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <AccordionItem key={log.id} value={log.id}>
                      <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center">
                            {log.agent === "pricingAgent" ? (
                              <DollarSign className="h-4 w-4 mr-2" />
                            ) : (
                              <Calendar className="h-4 w-4 mr-2" />
                            )}
                            <span>
                              {log.agent} - {log.action}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={log.status === "completed" ? "default" : "destructive"} className="ml-auto">
                              {log.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Dettagli:</span>
                          </div>
                          <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">Nessun log disponibile</div>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
