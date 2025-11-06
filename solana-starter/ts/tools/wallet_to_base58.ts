import prompt from "prompt";
import bs58 from "bs58";
import * as fs from "fs";
import path from "path";

const file = path.join(__dirname, "wallet.json");

(async () => {
  try {
    // prompt.start();
    // console.log(`Enter the Wallet Byte Array from ~/.config/solana/id.json`);
    // const { wallet1 } = await prompt.get(["wallet"]);
    //read from wallet file
    const wallet = fs.readFileSync(file, "utf-8");

    const keypair = bs58.encode(Buffer.from(JSON.parse(wallet as string)));
    console.log(`keypair - ${keypair}`);
  } catch (e) {
    console.log(`Some error- ${e}`);
  }
})();
