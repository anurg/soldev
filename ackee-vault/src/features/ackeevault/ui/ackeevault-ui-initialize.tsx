import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useInitializeVaultMutation } from '../data-access/use-initialize-vault-mutation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AckeevaultUiInitialize({ account }: { account: UiWalletAccount }) {
  const [vaultId, setVaultId] = useState('')
  const initializeMutation = useInitializeVaultMutation({ account })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = parseInt(vaultId)
    if (isNaN(id) || id < 0 || id > 65535) {
      return
    }
    initializeMutation.mutateAsync(id).then(() => {
      setVaultId('')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initialize Vault</CardTitle>
        <CardDescription>Create a new vault with a unique ID (0-65535)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vaultId">Vault ID</Label>
            <Input
              id="vaultId"
              type="number"
              min="0"
              max="65535"
              value={vaultId}
              onChange={(e) => setVaultId(e.target.value)}
              placeholder="Enter vault ID (e.g., 1)"
              required
            />
          </div>
          <Button type="submit" disabled={initializeMutation.isPending}>
            {initializeMutation.isPending ? 'Initializing...' : 'Initialize Vault'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
