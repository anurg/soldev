import { ACKEEVAULT_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function AckeevaultUiProgramExplorerLink() {
  return <AppExplorerLink address={ACKEEVAULT_PROGRAM_ADDRESS} label={ellipsify(ACKEEVAULT_PROGRAM_ADDRESS)} />
}
