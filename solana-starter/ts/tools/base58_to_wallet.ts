import bs58 from "bs58";
import * as fs from "fs";
import prompt from "prompt";
import * as path from "path";
import { Keypair } from "@solana/web3.js";

const file = path.join(__dirname, "wallet.json");
// prompt.start();
// console.log(`Enter the output of script-wallet-to-base58`);
(async () => {
  try {
    const { privkey } = await prompt.get(["privkey"]);
    const wallet = bs58.decode(privkey as string);

    console.log(`Wallet -${wallet}`);
    // write to wallet.json
    console.log(Array.from(wallet));
    fs.writeFileSync(file, JSON.stringify(Array.from(wallet)), "utf-8");
  } catch (e) {
    console.log(`Some error- ${e}`);
  }
})();
