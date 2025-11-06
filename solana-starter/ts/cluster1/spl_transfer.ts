import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import wallet from "/home/nkb/.config/solana/id.json";
import wallet1 from "./wallet.json";
import {
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  transfer,
} from "@solana/spl-token";
import { Key } from "@metaplex-foundation/mpl-token-metadata";
import fs from "fs";
import path from "path";
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const keypair = Keypair.fromSecretKey(Uint8Array.from(wallet));
const mint = new PublicKey("4qfeY1nNan6A5ekyj6RaVZxHxxoZRAQVbeYQAPoFCVZV");

const file = path.join(__dirname, "wallet.json");
const user = Keypair.fromSecretKey(Uint8Array.from(wallet1));
console.log(`User Public Key- ${user.publicKey}`);

(async () => {
  try {
    // const data = JSON.stringify(Array.from(user.secretKey));
    // console.log(`Key Data - ${data}`);
    // fs.writeFileSync(file, data, "utf-8");
    const from_ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    const to_ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      user.publicKey
    );
    const tx = await transfer(
      connection,
      keypair,
      from_ata.address,
      to_ata.address,
      keypair,
      100 * 10e6
    );
    console.log(`txn - ${tx}`);
  } catch (e) {
    console.log(`Some error-${e}`);
  }
})();
