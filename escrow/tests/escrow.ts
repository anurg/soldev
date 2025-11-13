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
  let vault = anchor.web3.PublicKey.findProgramAddressSync(
    Uint8Array.from([
      Buffer.from("escrow"),
      seed.toBuffer(),
      payer.publicKey.toBuffer(),
    ]),
    TOKEN_PROGRAM_ID
  );

  let user = anchor.web3.Keypair.generate();
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
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .make(seed, mint_a, mint_b, receive, amount)
      .accounts({
        maker: payer.publicKey,
        mintA: mint_a,
        mintB: mint_b,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
