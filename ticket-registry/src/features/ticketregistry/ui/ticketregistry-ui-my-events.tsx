import { useState } from 'react'
import { useGetEventsQuery, type EventAccount } from '../data-access/use-get-events-query'
import { useSolana } from '@/components/solana/use-solana'
import { AppAlert } from '@/components/app-alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWithdrawMutation } from '../data-access/use-withdraw-mutation'
import { UiWalletAccount } from '@wallet-ui/react'

function MyEventCard({ event, account }: { event: EventAccount; account: UiWalletAccount }) {
  const withdrawMutation = useWithdrawMutation({ account })
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const startDate = new Date(Number(event.data.startDate) * 1000)
  const ticketsSold = Number(event.data.availableTickets)
  const totalRevenue = Number(event.data.ticketPrice) * ticketsSold

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return

    await withdrawMutation.mutateAsync({
      eventAddress: event.address,
      amount: Number(withdrawAmount),
    })

    setWithdrawAmount('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.data.name}</CardTitle>
        <CardDescription>Event Management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Ticket Price:</span> {Number(event.data.ticketPrice) / 1e9} SOL
          </div>
          <div>
            <span className="font-semibold">Available:</span> {event.data.availableTickets.toString()} tickets
          </div>
          <div>
            <span className="font-semibold">Start Date:</span> {startDate.toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold">Est. Revenue:</span> {totalRevenue / 1e9} SOL
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor={`withdraw-${event.address}`}>Withdraw Funds (lamports)</Label>
          <div className="flex gap-2">
            <Input
              id={`withdraw-${event.address}`}
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount in lamports"
              min="0"
            />
            <Button onClick={handleWithdraw} disabled={withdrawMutation.isPending || !withdrawAmount}>
              {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            1 SOL = 1,000,000,000 lamports. Enter the amount you want to withdraw.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function TicketregistryUiMyEvents({ account }: { account: UiWalletAccount }) {
  const query = useGetEventsQuery()
  const { account: walletAccount } = useSolana()

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

  // Filter events where the current user is the organizer
  const myEvents =
    walletAccount && query.data
      ? query.data.filter((event) => event.data.eventOrganizer === walletAccount.address)
      : []

  if (myEvents.length === 0) {
    return <AppAlert>You haven&apos;t created any events yet. Create your first event above!</AppAlert>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Events</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {myEvents.map((event) => (
          <MyEventCard key={event.address} event={event} account={account} />
        ))}
      </div>
    </div>
  )
}
