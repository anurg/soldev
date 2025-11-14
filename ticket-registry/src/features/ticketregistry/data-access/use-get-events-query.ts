import { TICKETREGISTRY_PROGRAM_ADDRESS, getEventDecoder } from '@project/anchor'
import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'gill'

import type { Event } from '@project/anchor'

export type EventAccount = {
  address: Address
  data: Event
}

export function useGetEventsQuery() {
  const { client, cluster } = useSolana()

  return useQuery({
    queryKey: ['get-events', { cluster }],
    queryFn: async () => {
      try {
        // Fetch all accounts owned by the program
        // Note: We're not filtering by discriminator since there might be issues with the filter
        // Instead, we'll fetch all accounts and filter/decode them
        const accounts = await client.rpc.getProgramAccounts(TICKETREGISTRY_PROGRAM_ADDRESS).send()

        // Decode the event accounts
        const decoder = getEventDecoder()
        const eventAccounts: EventAccount[] = []

        for (const account of accounts) {
          try {
            const dataBuffer = Buffer.from(account.account.data, 'base64')
            const data = decoder.decode(new Uint8Array(dataBuffer))
            eventAccounts.push({
              address: account.pubkey,
              data,
            })
          } catch (e) {
            // Skip accounts that can't be decoded as Event (they might be Ticket accounts)
            continue
          }
        }

        return eventAccounts
      } catch (error) {
        console.error('Error fetching events:', error)
        return []
      }
    },
  })
}
