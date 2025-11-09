import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";

describe("vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // const wallet = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.vault as Program<Vault>;
  const vault_id = new anchor.BN(10010);

  const [vaultStatePDA, statebump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault_state"),
        provider.publicKey.toBuffer(),
        vault_id.toArrayLike(Buffer, "le", 2), // u16 is 2 bytes, if u64 then 8 bytes
      ],
      program.programId
    );
  const [vaultPDA, vaultbump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), vaultStatePDA.toBuffer()],
    program.programId
  );
  it("Vault Is initialized!", async () => {
    // Add your test here.

    const tx = await program.methods
      .initialize(vault_id.toNumber())
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
  it("Deposit in Vault", async () => {
    // Add your test here.

    const tx = await program.methods
      .deposit(
        vault_id.toNumber(),
        new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL)
      )
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const balance = await provider.connection.getBalance(vaultPDA, "confirmed");

    console.log(`Vault Balance lamports after Deposit- ${balance}`);
  });
  it("Withdraw from Vault", async () => {
    // Add your test here.
    const balance = await provider.connection.getBalance(vaultPDA);
    const amount = new anchor.BN(0.001 * anchor.web3.LAMPORTS_PER_SOL);
    console.log(`Vault Balance lamports- ${balance}`);
    if (balance >= amount.toNumber()) {
      const tx = await program.methods
        .withdraw(vault_id.toNumber(), amount)
        .accounts({
          maker: provider.publicKey,
          vaultState: vaultStatePDA,
          vault: vaultPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log("Your transaction signature", tx);
    }
  });
  it("Close Vault", async () => {
    // Add your test here.

    const tx = await program.methods
      .close(vault_id.toNumber())
      .accounts({
        maker: provider.publicKey,
        vaultState: vaultStatePDA,
        vault: vaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
