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
  let vault_ata: anchor.web3.PublicKey;
  before(async () => {
    mint = await createMint(connection, payer, provider.publicKey, null, 6);
    console.log(`mint address - ${mint}`);
    payer_ata = getAssociatedTokenAddressSync(mint, payer.publicKey, true);
    console.log(`Payer ATA - ${payer_ata}`);
    const ataTx = await createAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    console.log(`ATA created - ${ataTx}`);
    vault_ata = getAssociatedTokenAddressSync(mint, vaultStatePDA, true);
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

    const txSig = await program.methods
      .initialize()
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", txSig);
    // Testing for Vault generated Data
    const vaultData = await program.account.vaultState.fetch(vaultStatePDA);
    assert.strictEqual(
      vaultData.mint.toString(),
      mint.toString(),
      "Vault Mint should be Mint."
    );
    // Testing for Vault Initialization Logs
    const tx = await provider.connection.getParsedTransaction(
      txSig,
      "confirmed"
    );
    console.log(`tx1-${tx.meta}`);
    const eventParser = new anchor.EventParser(
      program.programId,
      new anchor.BorshCoder(program.idl)
    );
    console.log(`eventParser-${eventParser}`);
    const events = eventParser.parseLogs(tx.meta.logMessages);

    let logs_emitted = false;
    for (let event of events) {
      if (event.name === "initializeEvent") {
        logs_emitted = true;
        assert.strictEqual(
          event.data.vault.toString(),
          vault_ata.toString(),
          "Event Vault should match the Vault PDA"
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
    const amount = new anchor.BN(20 * decimals);
    // Before Deposit Balances
    const payer_before = await provider.connection.getBalance(payer.publicKey);
    const vault_before = await provider.connection.getBalance(vault_ata);

    const txSig = await program.methods
      .deposit(new anchor.BN(20 * decimals))
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", txSig);
    // After Deposit Balances
    const payer_after = await provider.connection.getBalance(payer.publicKey);
    const vault_after = await provider.connection.getBalance(vault_ata);

    //Test that Balances have changed
    assert.isTrue(
      payer_before > payer_after,
      "Payer Balance should decrease after Deposit!"
    );

    assert.isTrue(
      vault_after >= vault_before,
      "Vault Balance should increase after Deposit!"
    );
    // Test Event Logs
    const tx = await provider.connection.getParsedTransaction(
      txSig,
      "confirmed"
    );
    const eventParser = new anchor.EventParser(
      program.programId,
      new anchor.BorshCoder(program.idl)
    );
    const events = eventParser.parseLogs(tx.meta.logMessages);
    let log_emitted = false;
    for (let event of events) {
      if (event.name === "depositEvent") {
        log_emitted = true;
        assert.strictEqual(
          event.data.amount.toNumber(),
          amount.toNumber(),
          "Log Amount should be equal to Deposit"
        );
        assert.strictEqual(
          event.data.maker.toString(),
          payer.publicKey.toString(),
          "Emitted Log Payer should be equal to Payer"
        );
        assert.strictEqual(
          event.data.vault.toString(),
          vault_ata.toString(),
          "Emitted Log vault should be equal to derived vault"
        );
      }
    }
    assert.isTrue(log_emitted, "Depost Event logs not emitted!");
  });

  it("Withdraw from Vault!", async () => {
    // Add your test here.
    const amount = new anchor.BN(10 * decimals);
    // get the before balances
    const payer_before = await provider.connection.getTokenAccountBalance(
      payer_ata
    );
    const vault_before = await provider.connection.getTokenAccountBalance(
      vault_ata
    );

    const txSig = await program.methods
      .withdraw(amount)
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", txSig);
    // get the After balances
    const payer_after = await provider.connection.getTokenAccountBalance(
      payer_ata
    );

    const vault_after = await provider.connection.getTokenAccountBalance(
      vault_ata
    );
    //Test for Balance updates
    console.log(`payer_after.value.amount-${payer_after.value.amount}`);
    console.log(`payer_before.value.amount-${payer_before.value.amount}`);

    assert.isTrue(
      payer_after.value.amount > payer_before.value.amount,
      "Payer Balance should increase after withdrawal!"
    );
    console.log(`vault_after.value.amount-${vault_after.value.amount}`);
    console.log(`pvault_before.value.amount-${vault_before.value.amount}`);
    assert.isTrue(
      vault_after.value.amount < vault_before.value.amount,
      "Vault Balance should decrease after withdrawal!"
    );
    // Test emitted Logs for Withdrawal Instructions
    const tx = await provider.connection.getParsedTransaction(
      txSig,
      "confirmed"
    );
    const eventParser = new anchor.EventParser(
      program.programId,
      new anchor.BorshCoder(program.idl)
    );
    const events = eventParser.parseLogs(tx.meta.logMessages);
    let logs_emitted = false;
    for (let event of events) {
      if (event.name === "withdrawEvent") {
        logs_emitted = true;
        assert.strictEqual(
          event.data.amount.toNumber(),
          amount.toNumber(),
          "Log amount should be equal to Withdrawal Amount!"
        );
        assert.strictEqual(
          event.data.maker.toString(),
          payer.publicKey.toString(),
          "Emitted Log payer should be same as Payer."
        );
        assert.strictEqual(
          event.data.vault.toString(),
          vault_ata.toString(),
          "Emitted Vault address should be same as Vault!"
        );
      }
    }
    assert.isTrue(logs_emitted, "Withdraw Logs not emitted!");
  });
  it("Close Vault!", async () => {
    // Add your test here.
    // get the before balances
    const payer_before = await provider.connection.getTokenAccountBalance(
      payer_ata
    );
    const vault_before = await provider.connection.getTokenAccountBalance(
      vault_ata
    );
    const txSig = await program.methods
      .close()
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });
    console.log("Your transaction signature", txSig);
    // get the After balances
    const payer_after = await provider.connection.getTokenAccountBalance(
      payer_ata
    );

    //Test for Balance updates
    console.log(`payer_after.value.amount-${payer_after.value.amount}`);
    console.log(`payer_before.value.amount-${payer_before.value.amount}`);

    assert.isTrue(
      parseInt(payer_after.value.amount) > parseInt(payer_before.value.amount),
      "Payer Balance should increase after vault Close!"
    );

    console.log(`vault_before.value.amount-${vault_before.value.amount}`);
    assert.isTrue(
      parseInt(payer_after.value.amount) -
        parseInt(payer_before.value.amount) ===
        parseInt(vault_before.value.amount),
      "Increase in Payer Balance should be equal to Vault Amount after vault Close"
    );
    // Test for emitted Logs
    const tx = await provider.connection.getParsedTransaction(
      txSig,
      "confirmed"
    );
    const eventParser = new anchor.EventParser(
      program.programId,
      new anchor.BorshCoder(program.idl)
    );
    const events = eventParser.parseLogs(tx.meta.logMessages);
    let logs_emitted = false;
    for (let event of events) {
      if (event.name === "closeEvent") {
        logs_emitted = true;
        assert.strictEqual(
          event.data.maker.toString(),
          payer.publicKey.toString(),
          "Maker in Emitted Log should be payer."
        );
        assert.strictEqual(
          event.data.mint.toString(),
          mint.toString(),
          "Emitted Log mint should be same as mint!"
        );
        assert.strictEqual(
          event.data.vault.toString(),
          vault_ata.toString(),
          "Emitted Log mint should be same as mint!"
        );
        assert.strictEqual(
          event.data.makerAta.toString(),
          payer_ata.toString(),
          "Emitted Log mint should be same as mint!"
        );
      }
    }
    assert.isTrue(logs_emitted, "CloseEvent Logs not emitted!");
  });
});
