import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { UiWalletAccount } from '@wallet-ui/react'
import { getProgramDerivedAddress, getAddressEncoder, getBytesEncoder, address, getU16Encoder } from 'gill'
import { ACKEEVAULT_PROGRAM_ADDRESS, fetchMaybeVaultState } from '@project/anchor'

export function useGetVaultAccountsQuery({ account }: { account: UiWalletAccount }) {
  const { client, cluster } = useSolana()

  return useQuery({
    queryKey: ['vault-accounts', { cluster, address: account.address }],
    queryFn: async () => {
      // Fetch vault accounts by checking a wide range of vault IDs
      // This is more reliable than getProgramAccounts for this use case
      const vaultStates = []

      // Check vault IDs in chunks to optimize performance
      // Check 0-200 to cover most use cases
      const maxVaultId = 200

      // Use Promise.all with batches to speed up fetching
      const batchSize = 20
      for (let start = 0; start < maxVaultId; start += batchSize) {
        const promises = []
        for (let vaultId = start; vaultId < Math.min(start + batchSize, maxVaultId); vaultId++) {
          promises.push(
            (async () => {
              try {
                const [vaultStateAddress] = await getProgramDerivedAddress({
                  programAddress: ACKEEVAULT_PROGRAM_ADDRESS,
                  seeds: [
                    getBytesEncoder().encode(new Uint8Array([118, 97, 117, 108, 116, 95, 115, 116, 97, 116, 101])), // "vault_state"
                    getAddressEncoder().encode(address(account.address)),
                    getU16Encoder().encode(vaultId),
                  ],
                })

                const vaultState = await fetchMaybeVaultState(client.rpc, vaultStateAddress)

                if (!vaultState.exists) return null

                // Get the vault PDA
                const [vaultAddress] = await getProgramDerivedAddress({
                  programAddress: ACKEEVAULT_PROGRAM_ADDRESS,
                  seeds: [
                    getBytesEncoder().encode(new Uint8Array([118, 97, 117, 108, 116])), // "vault"
                    getAddressEncoder().encode(address(vaultStateAddress)),
                  ],
                })

                // Get vault balance
                const vaultAccount = await client.rpc.getAccountInfo(vaultAddress).send()
                const balance = vaultAccount.value?.lamports ?? 0n

                return {
                  vaultId,
                  vaultStateAddress,
                  vaultAddress,
                  vaultState: vaultState.data,
                  balance,
                }
              } catch (error) {
                // Vault doesn't exist or error fetching, skip
                return null
              }
            })()
          )
        }

        const results = await Promise.all(promises)
        vaultStates.push(...results.filter((v) => v !== null))
      }

      return vaultStates
    },
  })
}
