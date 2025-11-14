import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { AckeevaultUiProgramExplorerLink } from './ui/ackeevault-ui-program-explorer-link'
import { AckeevaultUiInitialize } from './ui/ackeevault-ui-initialize'
import { AckeevaultUiVaults } from './ui/ackeevault-ui-vaults'

export default function AckeevaultFeature() {
  const { account } = useSolana()

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="hero py-[64px]">
          <div className="hero-content text-center">
            <WalletDropdown />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHero title="Ackee Vault" subtitle="Manage your personal vaults on Solana">
        <p className="mb-6">
          <AckeevaultUiProgramExplorerLink />
        </p>
      </AppHero>
      <div className="max-w-6xl mx-auto space-y-6 p-4">
        <AckeevaultUiInitialize account={account} />
        <AckeevaultUiVaults account={account} />
      </div>
    </div>
  )
}
