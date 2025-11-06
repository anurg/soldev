import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import prompt from "prompt";
const connection = new Connection("http://localhost:8899", "confirmed");
// prompt.start();
// console.log(`Please enter the wallet address & no of Sol required as airdrop`);

export default async function airdrop_to_wallet(
  wallet: PublicKey,
  noSol: number
) {
  try {
    // const { wallet, noSol } = await prompt.get(["wallet", "noSol"]);
    // const keypair = new PublicKey(wallet as string);
    const tx = await connection.requestAirdrop(
      wallet,
      // LAMPORTS_PER_SOL * parseInt(noSol as string)
      LAMPORTS_PER_SOL * noSol
    );

    console.log(`Transaction signature is : ${tx}`);
  } catch (e) {
    console.log(`Some error: ${e}`);
  }
}
