import { useState } from 'react'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useInitializeEventMutation } from '../data-access/use-initialize-event-mutation'

export function TicketregistryUiCreate({ account }: { account: UiWalletAccount }) {
  const initializeEventMutation = useInitializeEventMutation({ account })
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [availableTickets, setAvailableTickets] = useState('')
  const [startDate, setStartDate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Convert date string to Unix timestamp
    const dateTimestamp = new Date(startDate).getTime() / 1000

    await initializeEventMutation.mutateAsync({
      name,
      description,
      ticketPrice: Number(ticketPrice),
      availableTickets: Number(availableTickets),
      startDate: dateTimestamp,
    })

    // Reset form
    setName('')
    setDescription('')
    setTicketPrice('')
    setAvailableTickets('')
    setStartDate('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter event name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
          required
        />
      </div>

      <div>
        <Label htmlFor="ticketPrice">Ticket Price (lamports)</Label>
        <Input
          id="ticketPrice"
          type="number"
          value={ticketPrice}
          onChange={(e) => setTicketPrice(e.target.value)}
          placeholder="Enter ticket price in lamports"
          required
          min="0"
        />
      </div>

      <div>
        <Label htmlFor="availableTickets">Available Tickets</Label>
        <Input
          id="availableTickets"
          type="number"
          value={availableTickets}
          onChange={(e) => setAvailableTickets(e.target.value)}
          placeholder="Enter number of available tickets"
          required
          min="1"
        />
      </div>

      <div>
        <Label htmlFor="startDate">Start Date (must be in the future)</Label>
        <Input
          id="startDate"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
          required
        />
      </div>

      <Button type="submit" disabled={initializeEventMutation.isPending}>
        {initializeEventMutation.isPending ? 'Creating Event...' : 'Create Event'}
      </Button>
    </form>
  )
}
