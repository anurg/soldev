import { useGetEventsQuery, type EventAccount } from '../data-access/use-get-events-query'
import { useSolana } from '@/components/solana/use-solana'
import { AppAlert } from '@/components/app-alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBuyTicketMutation } from '../data-access/use-buy-ticket-mutation'
import { UiWalletAccount } from '@wallet-ui/react'

function EventCard({ event, account }: { event: EventAccount; account: UiWalletAccount }) {
  const buyTicketMutation = useBuyTicketMutation({ account })
  const { account: walletAccount } = useSolana()

  const startDate = new Date(Number(event.data.startDate) * 1000)
  const isOrganizer = walletAccount ? walletAccount.address === event.data.eventOrganizer : false

  const handleBuyTicket = async () => {
    await buyTicketMutation.mutateAsync(event.address)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.data.name}</CardTitle>
        <CardDescription>{event.data.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Price:</span> {Number(event.data.ticketPrice) / 1e9} SOL
          </div>
          <div>
            <span className="font-semibold">Available:</span> {event.data.availableTickets.toString()} tickets
          </div>
          <div>
            <span className="font-semibold">Start Date:</span> {startDate.toLocaleDateString()}{' '}
            {startDate.toLocaleTimeString()}
          </div>
          <div>
            <span className="font-semibold">Organizer:</span>{' '}
            <span className="text-xs">{event.data.eventOrganizer.slice(0, 8)}...</span>
          </div>
        </div>
        <div className="pt-4">
          {isOrganizer ? (
            <div className="text-sm text-muted-foreground">You are the organizer of this event</div>
          ) : (
            <Button
              onClick={handleBuyTicket}
              disabled={buyTicketMutation.isPending || Number(event.data.availableTickets) === 0}
              className="w-full"
            >
              {buyTicketMutation.isPending
                ? 'Buying...'
                : Number(event.data.availableTickets) === 0
                  ? 'Sold Out'
                  : 'Buy Ticket'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TicketregistryUiEventsList({ account }: { account: UiWalletAccount }) {
  const query = useGetEventsQuery()

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (query.isError) {
    return <AppAlert>Error loading events: {(query.error as Error).message}</AppAlert>
  }

  if (!query.data || query.data.length === 0) {
    return <AppAlert>No events found. Create your first event above!</AppAlert>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Available Events</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {query.data.map((event) => (
          <EventCard key={event.address} event={event} account={account} />
        ))}
      </div>
    </div>
  )
}
