import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import {
  createMint,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ConfirmedTransaction } from "@solana/web3.js";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
describe("escrow", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = (provider.wallet as anchor.Wallet).payer;

  const program = anchor.workspace.escrow as Program<Escrow>;
  const decimals = 1_000_000;
  const seed = new anchor.BN(1001);
  const receive = new anchor.BN(1000 * decimals);
  const amount = new anchor.BN(2000 * decimals);
  let mint_a: anchor.web3.PublicKey;
  let mint_b: anchor.web3.PublicKey;
  let payer_ata_a: anchor.web3.PublicKey;
  let payer_ata_b: anchor.web3.PublicKey;

  let user_ata_b: anchor.web3.PublicKey;
  let user_ata_a: anchor.web3.PublicKey;
  let vault: anchor.web3.PublicKey;
  let [escrowPDA, escrowBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      seed.toArrayLike(Buffer, "le", 8),
      payer.publicKey.toBuffer(),
    ],
    program.programId
  );

  let user = anchor.web3.Keypair.generate();
  console.log(`user-${user.publicKey}`);
  const airdrop = async (key: anchor.web3.PublicKey) => {
    const tx = await provider.connection.requestAirdrop(
      key,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(tx);
  };

  before(async () => {
    // Mint mint_a and Transfer to payer_ata_a 20000 tokens
    mint_a = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      6
    );
    console.log(`mint_a-${mint_a}`);
    payer_ata_a = await getAssociatedTokenAddress(
      mint_a,
      payer.publicKey,
      true
    );
    console.log(`payer_ata_a-${payer_ata_a}`);
    const ataTx = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      mint_a,
      payer.publicKey,
      true
    );
    console.log(`ataTx-${ataTx}`);
    const mintTx = await mintTo(
      provider.connection,
      payer,
      mint_a,
      payer_ata_a,
      payer,
      20000 * decimals
    );
    console.log(`mintTx-${mintTx}`);
    // Mint mint_b and Transfer to user_ata_b 10000 tokens
    await airdrop(user.publicKey);
    const balance = await provider.connection.getBalance(user.publicKey);
    console.log(`user balance- ${balance}`);
    mint_b = await createMint(
      provider.connection,
      user,
      user.publicKey,
      null,
      6
    );
    console.log(`mint_b-${mint_b}`);
    user_ata_b = await getAssociatedTokenAddress(mint_b, user.publicKey, true);
    console.log(`user_ata_b-${user_ata_b}`);
    const ataTxUser = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      user,
      mint_b,
      user.publicKey,
      true
    );
    console.log(`ataTx-${ataTx}`);
    const mintTxUser = await mintTo(
      provider.connection,
      user,
      mint_b,
      user_ata_b,
      user,
      20000 * decimals
    );
    console.log(`mintTxUser-${mintTxUser}`);
    // get the vault ATA address and create ATA
    vault = await getAssociatedTokenAddress(mint_a, escrowPDA, true);
    let vaultTx = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      mint_a,
      escrowPDA,
      true
    );
    console.log(`vault - ${vaultTx}`);
    // Create maker_ata_b  ATA
    payer_ata_b = await getAssociatedTokenAddress(
      mint_b,
      payer.publicKey,
      true
    );
    let payer_ata_bTx = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      mint_b,
      payer.publicKey,
      true
    );
    console.log(`payer_ata_bTx - ${payer_ata_bTx}`);
    // Create user_ata_a ATA
    user_ata_a = await getAssociatedTokenAddress(mint_a, user.publicKey, true);
    let user_ata_aTx = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      mint_a,
      user.publicKey,
      true
    );
    console.log(`user_ata_aTx - ${user_ata_aTx}`);
  });

  it("Vault Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .make(seed, mint_a, mint_b, receive, amount)
      .accountsStrict({
        maker: payer.publicKey,
        mintA: mint_a,
        mintB: mint_b,
        makerAtaA: payer_ata_a,
        vault: vault,
        escrow: escrowPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
  // it("Close Vault & Refund!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods
  //     .refund(seed)
  //     .accountsStrict({
  //       maker: payer.publicKey,
  //       mintA: mint_a,
  //       makerAtaA: payer_ata_a,
  //       vault: vault,
  //       escrow: escrowPDA,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       systemProgram: SYSTEM_PROGRAM_ID,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });
  it("User Takes the Offer", async () => {
    // Add your test here.
    const tx = await program.methods
      .take(seed)
      .accountsStrict({
        maker: payer.publicKey,
        mintA: mint_a,
        mintB: mint_b,
        makerAtaB: payer_ata_b,
        taker: user.publicKey,
        takerAtaA: user_ata_a,
        takerAtaB: user_ata_b,
        vault: vault,
        escrow: escrowPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      })
      .signers([user])
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
