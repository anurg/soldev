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
describe("token-vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const payer = (provider.wallet as anchor.Wallet).payer;
  const program = anchor.workspace.tokenVault as Program<TokenVault>;
  const [vaultPDA, vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), payer.publicKey.toBuffer()],
    program.programId
  );
  it("Is initialized!", async () => {
    // Add your test here.
    const decimals = 1_000_000;
    const mint = await createMint(
      connection,
      payer,
      provider.publicKey,
      null,
      6
    );
    console.log(`mint address - ${mint}`);
    const payer_ata = getAssociatedTokenAddressSync(
      mint,
      payer.publicKey,
      false
    );
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
    const tx = await program.methods
      .initialize()
      .accounts({
        maker: payer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
