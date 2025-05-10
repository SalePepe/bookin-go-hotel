"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/components/ui/use-toast"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Loader2, Edit, Globe, Plus } from "lucide-react"

interface ContentManagerProps {
  initialContent: any[]
}

export function ContentManager({ initialContent }: ContentManagerProps) {
  const [content, setContent] = useState(initialContent)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("all")
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  // Ottieni le sezioni uniche
  const sections = Array.from(new Set(content.map((item) => item.section)))

  // Filtra i contenuti in base alla sezione attiva
  const filteredContent = activeSection === "all" ? content : content.filter((item) => item.section === activeSection)

  const handleEditContent = (item: any) => {
    setSelectedContent(item)
    setIsDialogOpen(true)
  }

  const handleCreateContent = () => {
    setSelectedContent({
      section: "",
      key: "",
      content_it: "",
      content_en: "",
    })
    setIsDialogOpen(true)
  }

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedContent) return

    setIsLoading(true)

    try {
      if (selectedContent.id) {
        // Aggiorna contenuto esistente
        const { error } = await supabase
          .from("content")
          .update({
            section: selectedContent.section,
            key: selectedContent.key,
            content_it: selectedContent.content_it,
            content_en: selectedContent.content_en,
          })
          .eq("id", selectedContent.id)

        if (error) throw error

        // Aggiorna lo stato locale
        setContent(content.map((item) => (item.id === selectedContent.id ? selectedContent : item)))

        toast({
          title: "Contenuto aggiornato",
          description: "Il contenuto è stato aggiornato con successo.",
        })
      } else {
        // Crea nuovo contenuto
        const { data, error } = await supabase
          .from("content")
          .insert({
            section: selectedContent.section,
            key: selectedContent.key,
            content_it: selectedContent.content_it,
            content_en: selectedContent.content_en,
          })
          .select()

        if (error) throw error

        // Aggiorna lo stato locale
        setContent([...content, data[0]])

        toast({
          title: "Contenuto creato",
          description: "Il contenuto è stato creato con successo.",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving content:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del contenuto.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo contenuto?")) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from("content").delete().eq("id", contentId)

      if (error) throw error

      // Aggiorna lo stato locale
      setContent(content.filter((item) => item.id !== contentId))

      toast({
        title: "Contenuto eliminato",
        description: "Il contenuto è stato eliminato con successo.",
      })
    } catch (error) {
      console.error("Error deleting content:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del contenuto.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSelectedContent({ ...selectedContent, [name]: value })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestione Contenuti</h1>
        <Button onClick={handleCreateContent}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Contenuto
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tutti</TabsTrigger>
          {sections.map((section) => (
            <TabsTrigger key={section} value={section}>
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeSection} className="space-y-4">
          {filteredContent.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  onEdit={() => handleEditContent(item)}
                  onDelete={() => handleDeleteContent(item.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nessun contenuto disponibile</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.id ? "Modifica Contenuto" : "Aggiungi Contenuto"}</DialogTitle>
            <DialogDescription>
              {selectedContent?.id
                ? "Modifica i dettagli del contenuto esistente"
                : "Aggiungi un nuovo contenuto al sistema"}
            </DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <form onSubmit={handleSaveContent}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section">Sezione</Label>
                    <Input
                      id="section"
                      name="section"
                      value={selectedContent.section}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key">Chiave</Label>
                    <Input id="key" name="key" value={selectedContent.key} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_it">Contenuto (Italiano)</Label>
                  <Textarea
                    id="content_it"
                    name="content_it"
                    value={selectedContent.content_it}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_en">Contenuto (Inglese)</Label>
                  <Textarea
                    id="content_en"
                    name="content_en"
                    value={selectedContent.content_en}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    "Salva"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ContentCardProps {
  content: any
  onEdit: () => void
  onDelete: () => void
}

function ContentCard({ content, onEdit, onDelete }: ContentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{content.key}</CardTitle>
            <CardDescription>{content.section}</CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="inline-flex items-center mr-2 text-red-500">
              <Globe className="h-3 w-3 mr-1" />
              IT
            </span>
            <span className="line-clamp-2">{content.content_it}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="inline-flex items-center mr-2 text-blue-500">
              <Globe className="h-3 w-3 mr-1" />
              EN
            </span>
            <span className="line-clamp-2">{content.content_en}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
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
