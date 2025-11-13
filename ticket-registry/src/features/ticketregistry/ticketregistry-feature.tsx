import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { TicketregistryUiProgramExplorerLink } from './ui/ticketregistry-ui-program-explorer-link'
import { TicketregistryUiCreate } from './ui/ticketregistry-ui-create'
import { TicketregistryUiProgram } from '@/features/ticketregistry/ui/ticketregistry-ui-program'

export default function TicketregistryFeature() {
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
      <AppHero title="Ticketregistry" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <TicketregistryUiProgramExplorerLink />
        </p>
        <TicketregistryUiCreate account={account} />
      </AppHero>
      <TicketregistryUiProgram />
    </div>
  )
}
