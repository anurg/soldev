import {
  Keypair,
  Connection,
  type Commitment,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import prompt from "prompt";

(async () => {
  const commitment: Commitment = "confirmed";
  const conn = new Connection("http://localhost:8899");

  //   const keypair = Keypair.generate();
  prompt.start();
  console.log("Please enter the wallet address and no of SOL you want");

  const { wallet, noSol } = await prompt.get(["wallet", "noSol"]);
  console.log(`wallet -${wallet}`);
  const keypair = new PublicKey(wallet as string);
  console.log(`keypair -${keypair}`);
  try {
    // const tx = await conn.requestAirdrop(
    //   keypair,
    //   LAMPORTS_PER_SOL * parseInt(noSol as string)
    // );
    // console.log(`The txn signature is -${tx}`);

    const balance = await conn.getBalance(keypair);
    console.log(`Balance of wallet is : ${balance}`);
  } catch (err) {
    console.log(`Some error-${err}`);
  }
})();
