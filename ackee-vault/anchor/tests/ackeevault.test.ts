// import {
//   Blockhash,
//   createSolanaClient,
//   createTransaction,
//   Instruction,
//   KeyPairSigner,
//   signTransactionMessageWithSigners,
// } from 'gill'
// import { getGreetInstruction } from '../src'
// // @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
// import { loadKeypairSignerFromFile } from 'gill/node'

// const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })
// describe('ackeevault', () => {
//   let payer: KeyPairSigner

//   beforeAll(async () => {
//     payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
//   })

//   it('should run the program and print "GM!" to the transaction log', async () => {
//     // ARRANGE
//     expect.assertions(1)
//     const ix = getGreetInstruction()

//     // ACT
//     const sx = await sendAndConfirm({ ix, payer })

//     // ASSERT
//     expect(sx).toBeDefined()
//     console.log('Transaction signature:', sx)
//   })
// })

// // Helper function to keep the tests DRY
// let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
// async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
//   if (latestBlockhash) {
//     return latestBlockhash
//   }
//   return await rpc
//     .getLatestBlockhash()
//     .send()
//     .then(({ value }) => value)
// }
// async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
//   const tx = createTransaction({
//     feePayer: payer,
//     instructions: [ix],
//     version: 'legacy',
//     latestBlockhash: await getLatestBlockhash(),
//   })
//   const signedTransaction = await signTransactionMessageWithSigners(tx)
//   return await sendAndConfirmTransaction(signedTransaction)
// }
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Ackeevault } from '../target/types/ackeevault'
import BN from 'bn.js'

describe('Ackeevault', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  // const wallet = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Ackeevault as Program<Ackeevault>
  const vault_id = new BN(10010)

  const [vaultStatePDA, statebump] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('vault_state'),
      provider.publicKey.toBuffer(),
      vault_id.toArrayLike(Buffer, 'le', 2), // u16 is 2 bytes, if u64 then 8 bytes
    ],
    program.programId,
  )
  const [vaultPDA, vaultbump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), vaultStatePDA.toBuffer()],
    program.programId,
  )
  it('Vault Is initialized!', async () => {
    // Add your test here.

    const tx = await program.methods
      .initialize(vault_id.toNumber())
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
    console.log('Your transaction signature', tx)
  })
  it('Deposit in Vault', async () => {
    // Add your test here.

    const tx = await program.methods
      .deposit(vault_id.toNumber(), new BN(1 * anchor.web3.LAMPORTS_PER_SOL))
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
    console.log('Your transaction signature', tx)

    const balance = await provider.connection.getBalance(vaultPDA, 'confirmed')
    console.log(`Vault Balance lamports after Deposit- ${balance}`)
  })
  it('Withdraw from Vault', async () => {
    // Add your test here.
    const balance = await provider.connection.getBalance(vaultPDA)
    const amount = new BN(0.1 * anchor.web3.LAMPORTS_PER_SOL)
    console.log(`Vault Balance lamports- ${balance}`)

    const tx = await program.methods
      .withdraw(vault_id.toNumber(), amount)
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
    console.log('Your transaction signature', tx)

    const balance_after = await provider.connection.getBalance(vaultPDA, 'confirmed')
    console.log(`Vault Balance lamports after Withdrawal- ${balance_after}`)
  })
  it('Close Vault', async () => {
    // Add your test here.

    const tx = await program.methods
      .close(vault_id.toNumber())
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
    console.log('Your transaction signature', tx)
  })
})
