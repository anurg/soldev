import prompt from "prompt";
import bs58 from "bs58";

prompt.start();
console.log(`Enter the wallet file`);

const { privKey } = await prompt.get(["privKey"]);
const json = bs58.encode(Buffer.from(JSON.parse(privKey as string)));
console.log(`${json}`);

const wallet = bs58.decode(json);
console.log(`Wallet - ${wallet}`);
