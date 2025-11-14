import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { TicketregistryUiProgramExplorerLink } from './ui/ticketregistry-ui-program-explorer-link'
import { TicketregistryUiCreate } from './ui/ticketregistry-ui-create'
import { TicketregistryUiProgram } from '@/features/ticketregistry/ui/ticketregistry-ui-program'
import { TicketregistryUiEventsList } from './ui/ticketregistry-ui-events-list'
import { TicketregistryUiMyEvents } from './ui/ticketregistry-ui-my-events'
import { TicketregistryUiMyTickets } from './ui/ticketregistry-ui-my-tickets'

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
    <div className="space-y-8">
      <AppHero title="Ticket Registry" subtitle="Create events and manage ticket sales on Solana">
        <p className="mb-6">
          <TicketregistryUiProgramExplorerLink />
        </p>
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Create New Event</h3>
          <TicketregistryUiCreate account={account} />
        </div>
      </AppHero>

      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <TicketregistryUiMyTickets />
        <TicketregistryUiMyEvents account={account} />
        <TicketregistryUiEventsList account={account} />
        <div className="pt-8 border-t">
          <h3 className="text-xl font-bold mb-4">Program Information</h3>
          <TicketregistryUiProgram />
        </div>
      </div>
    </div>
  )
}
