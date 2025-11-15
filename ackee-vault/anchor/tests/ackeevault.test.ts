import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Ackeevault } from '../target/types/ackeevault'
import BN from 'bn.js'
import { assert, should } from 'chai'

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

  const bob_wallet = anchor.web3.Keypair.generate();
  // const bob_vault_id = new BN(108)

  // const [bob_vaultStatePDA, bob_statebump] = anchor.web3.PublicKey.findProgramAddressSync(
  //   [
  //     Buffer.from('vault_state'),
  //     bob_wallet.publicKey.toBuffer(),
  //     bob_vault_id.toArrayLike(Buffer, 'le', 2), // u16 is 2 bytes, if u64 then 8 bytes
  //   ],
  //   program.programId,
  // )
  // const [bob_vaultPDA, bob_vaultbump] = anchor.web3.PublicKey.findProgramAddressSync(
  //   [Buffer.from('vault'), bob_vaultStatePDA.toBuffer()],
  //   program.programId,
  // )

  //Happy Path
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
  //Unhappy Path
  it('Duplicate Vault  initialization should Fail!', async () => {
    let should_fail="This should fail"
    try {
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
    } catch (error) {
       should_fail = "Failed"
    }
    assert.strictEqual(should_fail,"Failed","Vault Initialization should have failed if User try to initialize duplicate Vault with same vault id.")
  })
  //Happy Path
  it('Deposit in Vault', async () => {
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
  //Unhappy Path
   it('Bob try to Deposit in Other Users Vault-should Fail', async () => {
    let should_fail="This should Fail"
    try {
       const tx = await program.methods
      .deposit(vault_id.toNumber(), new BN(1 * anchor.web3.LAMPORTS_PER_SOL))
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([bob_wallet])
      .rpc()
    console.log('Your transaction signature', tx)
    } catch (error) {
      should_fail="Failed"
    }
    assert.strictEqual(should_fail,"Failed","When some Other User tries to Deposit in User Vault, txn should Fail");

   const balance = await provider.connection.getBalance(vaultPDA, 'confirmed')
    console.log(`Vault Balance lamports after Deposit- ${balance}`)
  })
  //Happy Path
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
  //Unhappy Path
  it('Bob try to Withdraw from Other Users Vault-should Fail', async () => {
    const balance = await provider.connection.getBalance(vaultPDA)
    const amount = new BN(0.1 * anchor.web3.LAMPORTS_PER_SOL)
    console.log(`Vault Balance lamports- ${balance}`)
    let should_fail = "This should fail"
    try {
      const tx = await program.methods
      .withdraw(vault_id.toNumber(), amount)
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([bob_wallet])
      .rpc()
    console.log('Your transaction signature', tx)
    } catch (error) {
      should_fail="Failed"
    }
    assert.strictEqual(should_fail,"Failed","test should fail if Bob tries to withdraw from Other Users Vault")

    const balance_after = await provider.connection.getBalance(vaultPDA, 'confirmed')
    console.log(`Vault Balance lamports after Withdrawal- ${balance_after}`)
  })
  // Happy Path
  it('Close Vault', async () => {
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
   // Unhappy Path
  it('Bob try to Close other users Vault and get lamports-should Fail', async () => {
    let should_fail="This should fail"
    try {
      const tx = await program.methods
      .close(vault_id.toNumber())
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).signers([bob_wallet])
      .rpc()
    console.log('Your transaction signature', tx)
    } catch (error) {
      should_fail="Failed"
    }
    assert.strictEqual(should_fail,"Failed","Test should fail when Bob tries to close other Users vault")
  })
})
