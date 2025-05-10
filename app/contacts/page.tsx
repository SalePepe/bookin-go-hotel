import type { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { ContactInfo } from "@/components/contact-info"

export const metadata: Metadata = {
  title: "Contatti | Leonardo's Rooms",
  description:
    "Contatta Leonardo's Rooms per informazioni e prenotazioni. Risposte rapide via WhatsApp, email o telefono.",
}

export default function ContactsPage() {
  return (
    <>
      <section className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">Contatti</h1>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            Contattaci per informazioni e prenotazioni. Rispondiamo rapidamente via WhatsApp, email o telefono.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Come Raggiungerci</h2>
          <div className="aspect-video w-full rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2878.6983507291384!2d11.43908!3d43.804899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132b5354f8555555%3A0x1234567890abcdef!2sVia%20Piave%2C%207%2C%2050065%20Pontassieve%20FI!5e0!3m2!1sit!2sit!4v1620000000000!5m2!1sit!2sit"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="mt-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Indicazioni</h3>
            <div className="space-y-4">
              <p>
                <strong>In treno:</strong> La stazione ferroviaria di Pontassieve è a soli 5 minuti a piedi dalla nostra
                struttura. Ci sono treni regolari da Firenze Santa Maria Novella (20 minuti di viaggio).
              </p>
              <p>
                <strong>In auto:</strong> Da Firenze, prendere la SS67 in direzione Pontassieve. Una volta arrivati a
                Pontassieve, seguire le indicazioni per il centro. Via Piave si trova a pochi minuti dal centro storico.
              </p>
              <p>
                <strong>Dall&apos;aeroporto di Firenze:</strong> L&apos;aeroporto di Firenze-Peretola è a circa 30
                minuti di auto. È possibile prendere un taxi o utilizzare i mezzi pubblici (treno o autobus) per
                raggiungere Pontassieve.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
