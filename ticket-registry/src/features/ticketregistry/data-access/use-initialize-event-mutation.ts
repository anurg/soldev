import { getInitializeInstructionAsync } from '@project/anchor'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toastTx } from '@/components/toast-tx'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { createTransaction, signAndSendTransactionMessageWithSigners, getBase58Decoder } from 'gill'
import { useSolana } from '@/components/solana/use-solana'

export type InitializeEventData = {
  name: string
  description: string
  ticketPrice: number
  availableTickets: number
  startDate: number
}

export function useInitializeEventMutation({ account }: { account: UiWalletAccount }) {
  const txSigner = useWalletUiSigner({ account })
  const { client } = useSolana()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InitializeEventData) => {
      if (!txSigner || !account?.address) {
        throw new Error('Wallet not connected')
      }

      try {
        console.log('Getting latest blockhash...')
        const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
        console.log('Blockhash received:', latestBlockhash)

        console.log('Creating instruction with data:', {
          name: data.name,
          description: data.description,
          ticketPrice: data.ticketPrice,
          availableTickets: data.availableTickets,
          startDate: data.startDate,
          currentTime: Math.floor(Date.now() / 1000),
        })

        const instruction = await getInitializeInstructionAsync({
          eventOrganizer: txSigner,
          name: data.name,
          description: data.description,
          ticketPrice: data.ticketPrice,
          availableTickets: data.availableTickets,
          startDate: data.startDate,
        })
        console.log('Instruction created')

        console.log('Creating transaction...')
        const transaction = createTransaction({
          feePayer: txSigner,
          version: 0,
          latestBlockhash,
          instructions: [instruction],
        })
        console.log('Transaction created, signing and sending...')

        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        const signature = getBase58Decoder().decode(signatureBytes)

        console.log('Transaction signature:', signature)
        return signature
      } catch (error: unknown) {
        console.error('Transaction failed:', error)
        // Try to extract more detailed error information
        if (error && typeof error === 'object') {
          if ('logs' in error) {
            console.error('Transaction logs:', error.logs)
          }
          if ('message' in error) {
            console.error('Error message:', error.message)
          }
        }
        throw error
      }
    },
    onSuccess: (signature) => {
      toastTx(signature)
      queryClient.invalidateQueries({ queryKey: ['get-program-account'] })
      toast.success('Event created successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error}`)
    },
  })
}
