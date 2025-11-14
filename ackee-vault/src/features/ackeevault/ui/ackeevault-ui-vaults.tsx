import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useGetVaultAccountsQuery } from '../data-access/use-get-vault-accounts-query'
import { useDepositMutation } from '../data-access/use-deposit-mutation'
import { useWithdrawMutation } from '../data-access/use-withdraw-mutation'
import { useCloseVaultMutation } from '../data-access/use-close-vault-mutation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AppExplorerLink } from '@/components/app-explorer-link'

export function AckeevaultUiVaults({ account }: { account: UiWalletAccount }) {
  const query = useGetVaultAccountsQuery({ account })
  const depositMutation = useDepositMutation({ account })
  const withdrawMutation = useWithdrawMutation({ account })
  const closeMutation = useCloseVaultMutation({ account })

  const [depositAmounts, setDepositAmounts] = useState<Record<number, string>>({})
  const [withdrawAmounts, setWithdrawAmounts] = useState<Record<number, string>>({})

  const handleDeposit = async (vaultId: number) => {
    const amount = depositAmounts[vaultId]
    if (!amount) return

    const lamports = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000))
    if (lamports <= 0) return

    await depositMutation.mutateAsync({ vaultId, amount: lamports })
    setDepositAmounts({ ...depositAmounts, [vaultId]: '' })
  }

  const handleWithdraw = async (vaultId: number) => {
    const amount = withdrawAmounts[vaultId]
    if (!amount) return

    const lamports = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000))
    if (lamports <= 0) return

    await withdrawMutation.mutateAsync({ vaultId, amount: lamports })
    setWithdrawAmounts({ ...withdrawAmounts, [vaultId]: '' })
  }

  const handleClose = async (vaultId: number) => {
    if (confirm(`Are you sure you want to close vault ${vaultId}? All remaining funds will be returned.`)) {
      await closeMutation.mutateAsync(vaultId)
    }
  }

  if (query.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Vaults</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!query.data || query.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Vaults</CardTitle>
          <CardDescription>No vaults found. Initialize a vault to get started.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Vaults</CardTitle>
        <CardDescription>Manage your vaults: deposit, withdraw, or close</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vault ID</TableHead>
                <TableHead>Balance (SOL)</TableHead>
                <TableHead>Vault Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((vault) => (
                <TableRow key={vault.vaultId}>
                  <TableCell className="font-medium">{vault.vaultId}</TableCell>
                  <TableCell>{(Number(vault.balance) / 1_000_000_000).toFixed(4)} SOL</TableCell>
                  <TableCell>
                    <AppExplorerLink address={vault.vaultAddress} label={vault.vaultAddress.slice(0, 8) + '...'} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {/* Deposit */}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          placeholder="SOL"
                          value={depositAmounts[vault.vaultId] || ''}
                          onChange={(e) => setDepositAmounts({ ...depositAmounts, [vault.vaultId]: e.target.value })}
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleDeposit(vault.vaultId)}
                          disabled={depositMutation.isPending || !depositAmounts[vault.vaultId]}
                        >
                          Deposit
                        </Button>
                      </div>

                      {/* Withdraw */}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          placeholder="SOL"
                          value={withdrawAmounts[vault.vaultId] || ''}
                          onChange={(e) => setWithdrawAmounts({ ...withdrawAmounts, [vault.vaultId]: e.target.value })}
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleWithdraw(vault.vaultId)}
                          disabled={withdrawMutation.isPending || !withdrawAmounts[vault.vaultId]}
                        >
                          Withdraw
                        </Button>
                      </div>

                      {/* Close */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleClose(vault.vaultId)}
                        disabled={closeMutation.isPending}
                        className="w-full"
                      >
                        Close Vault
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
