import { useGetTicketsQuery, type TicketAccount } from '../data-access/use-get-tickets-query'
import { useGetEventsQuery } from '../data-access/use-get-events-query'
import { useSolana } from '@/components/solana/use-solana'
import { AppAlert } from '@/components/app-alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function TicketCard({ ticket, eventName }: { ticket: TicketAccount; eventName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ticket</CardTitle>
        <CardDescription>{eventName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Event:</span> {ticket.data.event.slice(0, 8)}...
          </div>
          <div>
            <span className="font-semibold">Price Paid:</span> {Number(ticket.data.price) / 1e9} SOL
          </div>
          <div>
            <span className="font-semibold">Ticket Address:</span>{' '}
            <span className="text-xs font-mono">{ticket.address.slice(0, 16)}...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TicketregistryUiMyTickets() {
  const { account: walletAccount } = useSolana()
  const ticketsQuery = useGetTicketsQuery(
    walletAccount?.address ? (walletAccount.address as import('gill').Address) : undefined
  )
  const eventsQuery = useGetEventsQuery()

  if (!walletAccount) {
    return <AppAlert>Please connect your wallet to view your tickets.</AppAlert>
  }

  if (ticketsQuery.isLoading || eventsQuery.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (ticketsQuery.isError) {
    return <AppAlert>Error loading tickets: {(ticketsQuery.error as Error).message}</AppAlert>
  }

  if (!ticketsQuery.data || ticketsQuery.data.length === 0) {
    return <AppAlert>You haven&apos;t purchased any tickets yet. Browse events below to buy tickets!</AppAlert>
  }

  // Create a map of event addresses to event names
  const eventNameMap = new Map(eventsQuery.data?.map((event) => [event.address, event.data.name]) || [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Tickets</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ticketsQuery.data.map((ticket) => (
          <TicketCard key={ticket.address} ticket={ticket} eventName={eventNameMap.get(ticket.data.event) || 'Unknown Event'} />
        ))}
      </div>
    </div>
  )
}
