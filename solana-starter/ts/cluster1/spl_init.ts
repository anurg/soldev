import { Connection, Keypair } from "@solana/web3.js";
import { createMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import wallet from "/home/nkb/.config/solana/id.json";

const keypair = Keypair.fromSecretKey(Uint8Array.from(wallet));
console.log(`${keypair.publicKey}`);
(async () => {
  const connection: Connection = new Connection(
    "http://api.devnet.solana.com",
    "confirmed"
  );
  try {
    const mint = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      6
      // undefined,
      // {},
      // TOKEN_2022_PROGRAM_ID
    );
    console.log(`Token Minted- ${mint}`);
  } catch (e) {
    console.log(`Some Error - ${e}`);
  }
})();
