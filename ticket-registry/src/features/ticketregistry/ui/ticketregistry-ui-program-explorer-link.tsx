import { TICKETREGISTRY_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function TicketregistryUiProgramExplorerLink() {
  return <AppExplorerLink address={TICKETREGISTRY_PROGRAM_ADDRESS} label={ellipsify(TICKETREGISTRY_PROGRAM_ADDRESS)} />
}
