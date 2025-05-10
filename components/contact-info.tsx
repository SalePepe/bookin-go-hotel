import { MapPin, Phone, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ContactInfo() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Informazioni di Contatto</h2>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Indirizzo</h3>
                <p className="text-muted-foreground">
                  Via Piave, 7<br />
                  50065 Pontassieve (FI)
                  <br />
                  Italia
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Telefono</h3>
                <p className="text-muted-foreground">
                  <a href="tel:+39360923824" className="hover:text-primary">
                    +39 360923824
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Email</h3>
                <p className="text-muted-foreground">
                  <a href="mailto:info@leonardosrooms.it" className="hover:text-primary">
                    info@leonardosrooms.it
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start">
              <MessageSquare className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold mb-1">WhatsApp</h3>
                <p className="text-muted-foreground mb-3">
                  Contattaci direttamente su WhatsApp per una risposta rapida.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <a href="https://wa.me/39360923824" target="_blank" rel="noopener noreferrer">
                    Chatta su WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Orari</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Check-in:</span>
            <span>14:00 - 20:00</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Check-out:</span>
            <span>entro le 10:00</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Reception:</span>
            <span>08:00 - 20:00</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Per check-in fuori orario, contattaci in anticipo per organizzare.
        </p>
      </div>
    </div>
  )
}
