import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenVault } from "../target/types/token_vault";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createMint,
  getAssociatedTokenAddressSync,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { min } from "bn.js";
import { assert } from "chai";
describe("token-vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const payer = (provider.wallet as anchor.Wallet).payer;
  const program = anchor.workspace.tokenVault as Program<TokenVault>;
  const [vaultStatePDA, vaultStateBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault_state"), payer.publicKey.toBuffer()],
      program.programId
    );
  const decimals = 1_000_000;
  let mint: anchor.web3.PublicKey;
  let payer_ata: anchor.web3.PublicKey;
  before(async () => {
    mint = await createMint(connection, payer, provider.publicKey, null, 6);
    console.log(`mint address - ${mint}`);
    payer_ata = getAssociatedTokenAddressSync(mint, payer.publicKey, false);
    console.log(`Payer ATA - ${payer_ata}`);
    const ataTx = await createAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    console.log(`ATA created - ${ataTx}`);
    const mintTx = await mintTo(
      connection,
      payer,
      mint,
      payer_ata,
      payer,
      1000 * decimals
    );
    console.log(`mintTo Tx - ${mintTx}`);
  });
  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    // Testing for Vault generated Data
    const vaultData = await program.account.vaultState.fetch(vaultStatePDA);
    assert.strictEqual(
      vaultData.mint.toString(),
      mint.toString(),
      "Vault Mint should be Mint."
    );
    // Testing for Vault Initialization Logs
    const tx1 = await provider.connection.getParsedTransaction(tx, "confirmed");
    console.log(`tx1-${tx1}`);
    const eventParser = new anchor.EventParser(
      program.programId,
      new anchor.BorshCoder(program.idl)
    );
    console.log(`eventParser-${eventParser}`);
    const events = eventParser.parseLogs(tx1.meta.logMessages);
    let logs_emitted = false;
    for (let event of events) {
      if (event.name === "initializeEvent") {
        logs_emitted = true;
        assert.strictEqual(
          event.data.vault.toString(),
          vaultStateBump.toString(),
          "Event Vault should match the VaultState PDA"
        );
        assert.strictEqual(
          event.data.mint.toString(),
          mint.toString(),
          "Event mint should match the mint key"
        );
      }
    }
    assert.isTrue(logs_emitted, "Logs should have been emitted!");
  });

  it("Deposit in Vault!", async () => {
    // Add your test here.
    const tx = await program.methods
      .deposit(new anchor.BN(20 * decimals))
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
  it("Withdraw from Vault!", async () => {
    // Add your test here.
    const tx = await program.methods
      .withdraw(new anchor.BN(10 * decimals))
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
  it("Close Vault!", async () => {
    // Add your test here.
    const tx = await program.methods
      .close()
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
