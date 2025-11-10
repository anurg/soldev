import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TokenVault } from "../target/types/token_vault";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
describe("token-vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const payer = (provider.wallet as anchor.Wallet).payer;
  const program = anchor.workspace.tokenVault as Program<TokenVault>;
  const [vaultPDA, vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
    Uint8Array.from([Buffer.from("vault_state")]),
    TOKEN_PROGRAM_ID
  );
  it("Is initialized!", async () => {
    // Add your test here.
    const mint = await createMint(
      connection,
      payer,
      provider.publicKey,
      null,
      6
    );
    const mintTx = await mintTo(
      connection,
      payer,
      mint,
      provider.publicKey,
      provider.publicKey,
      1000_000_000
    );
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
