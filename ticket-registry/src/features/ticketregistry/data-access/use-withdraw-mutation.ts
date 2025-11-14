import { getWithdrawInstruction } from '@project/anchor'
import type { Address } from 'gill'
import { createTransaction, signAndSendTransactionMessageWithSigners, getBase58Decoder } from 'gill'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toastTx } from '@/components/toast-tx'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useSolana } from '@/components/solana/use-solana'

export type WithdrawData = {
  eventAddress: Address
  amount: number
}

export function useWithdrawMutation({ account }: { account: UiWalletAccount }) {
  const txSigner = useWalletUiSigner({ account })
  const { client } = useSolana()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: WithdrawData) => {
      if (!txSigner) {
        throw new Error('Wallet not connected')
      }

      try {
        const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

        const instruction = getWithdrawInstruction({
          eventOrganizer: txSigner,
          event: data.eventAddress,
          amount: data.amount,
        })

        const transaction = createTransaction({
          feePayer: txSigner,
          version: 0,
          latestBlockhash,
          instructions: [instruction],
        })

        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
        const signature = getBase58Decoder().decode(signatureBytes)

        console.log('Transaction signature:', signature)
        return signature
      } catch (error: unknown) {
        console.error('Transaction failed:', error)
        throw error
      }
    },
    onSuccess: (signature) => {
      toastTx(signature)
      queryClient.invalidateQueries({ queryKey: ['get-program-account'] })
      toast.success('Funds withdrawn successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to withdraw funds: ${error}`)
    },
  })
}
