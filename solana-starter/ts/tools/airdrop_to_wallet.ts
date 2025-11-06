import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import prompt from "prompt";
const connection = new Connection("http://localhost:8899", "confirmed");
prompt.start();
console.log(`Please enter the wallet address & no of Sol required as airdrop`);

(async () => {
  try {
    const { wallet, noSol } = await prompt.get(["wallet", "noSol"]);
    const keypair = new PublicKey(wallet as string);
    const tx = await connection.requestAirdrop(
      keypair,
      LAMPORTS_PER_SOL * parseInt(noSol as string)
    );

    console.log(`Transaction signature is : ${tx}`);
  } catch (e) {
    console.log(`Some error: ${e}`);
  }
})();
