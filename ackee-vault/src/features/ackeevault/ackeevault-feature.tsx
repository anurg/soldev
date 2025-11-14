import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { AckeevaultUiProgramExplorerLink } from './ui/ackeevault-ui-program-explorer-link'
import { AckeevaultUiCreate } from './ui/ackeevault-ui-create'
import { AckeevaultUiProgram } from '@/features/ackeevault/ui/ackeevault-ui-program'

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
      <AppHero title="Ackeevault" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <AckeevaultUiProgramExplorerLink />
        </p>
        <AckeevaultUiCreate account={account} />
      </AppHero>
      <AckeevaultUiProgram />
    </div>
  )
}
