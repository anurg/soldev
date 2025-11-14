import { TICKETREGISTRY_PROGRAM_ADDRESS, getTicketDecoder } from '@project/anchor'
import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'gill'

import type { Ticket } from '@project/anchor'

export type TicketAccount = {
  address: Address
  data: Ticket
}

export function useGetTicketsQuery(buyerAddress?: Address) {
  const { client, cluster } = useSolana()

  return useQuery({
    queryKey: ['get-tickets', { cluster, buyer: buyerAddress }],
    queryFn: async () => {
      if (!buyerAddress) return []

      try {
        // Fetch all accounts owned by the program
        const accounts = await client.rpc.getProgramAccounts(TICKETREGISTRY_PROGRAM_ADDRESS).send()

        // Decode the ticket accounts
        const decoder = getTicketDecoder()
        const ticketAccounts: TicketAccount[] = []

        for (const account of accounts) {
          try {
            const dataBuffer = Buffer.from(account.account.data, 'base64')
            const data = decoder.decode(new Uint8Array(dataBuffer))
            ticketAccounts.push({
              address: account.pubkey,
              data,
            })
          } catch (e) {
            // Skip accounts that can't be decoded as Ticket (they might be Event accounts)
            continue
          }
        }

        // Filter tickets for the specific buyer
        return ticketAccounts.filter((ticket) => ticket.data.buyer === buyerAddress)
      } catch (error) {
        console.error('Error fetching tickets:', error)
        return []
      }
    },
    enabled: !!buyerAddress,
  })
}
