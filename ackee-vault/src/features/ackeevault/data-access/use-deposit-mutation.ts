import { ACKEEVAULT_PROGRAM_ADDRESS, getDepositInstructionAsync } from '@project/anchor'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { toastTx } from '@/components/toast-tx'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'

export function useDepositMutation({ account }: { account: UiWalletAccount }) {
  const txSigner = useWalletUiSigner({ account })
  const signAndSend = useWalletUiSignAndSend()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ vaultId, amount }: { vaultId: number; amount: bigint }) => {
      const instruction = await getDepositInstructionAsync(
        {
          maker: txSigner,
          vaultId,
          amount,
        },
        { programAddress: ACKEEVAULT_PROGRAM_ADDRESS }
      )
      return await signAndSend(instruction, txSigner)
    },
    onSuccess: (signature) => {
      toastTx(signature)
      // Wait a bit for the transaction to be confirmed before refetching
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['vault-accounts'] })
        queryClient.invalidateQueries({ queryKey: ['vault-balance'] })
      }, 2000)
    },
    onError: (error) => {
      toast.error(`Failed to deposit: ${error.message}`)
    },
  })
}
