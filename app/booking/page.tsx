import { BookingFlow } from "@/components/booking-flow/steps"

export default function BookingPage({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Prenota il tuo soggiorno</h1>
      <BookingFlow />
    </div>
  )
}
