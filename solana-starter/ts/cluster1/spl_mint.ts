import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import wallet from "/home/nkb/.config/solana/id.json";
import airdrop_to_wallet from "../tools/airdrop_to_wallet";

const keypair = Keypair.fromSecretKey(Uint8Array.from(wallet));
const mint = new PublicKey("CMT1xBPWCFcnbQoR3spVsUQCVQF5iDwa3E74g3KujUKD");
const connection = new Connection("http://localhost:8899", "confirmed");
const user = Keypair.generate();
console.log(`User wallet- ${user.publicKey}`);

airdrop_to_wallet(user.publicKey, 100);

(async () => {
  try {
    const decimals = (
      await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID)
    ).decimals;
    console.log(`decimals - ${decimals}`);
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      user.publicKey,
      false,
      undefined,
      { commitment: "confirmed" },
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const tx = await mintTo(
      connection,
      keypair,
      mint,
      ata.address,
      keypair,
      1231 * 10 ** decimals,
      [],
      { commitment: "confirmed" },
      TOKEN_2022_PROGRAM_ID
    );
    console.log(`Token Minted- ${tx}`);
    // Check the balance
    const info = await getAccount(
      connection,
      ata.address,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );
    const balance = Number(info.amount) / 10 ** decimals;
    console.log(`SPL Token Balance- ${balance}`);
  } catch (e) {
    console.log(`Some error-${e}`);
  }
})();
