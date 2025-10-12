import bs58 from "bs58";
// import * as prompt from "prompt-sync";

let wallet = [
  216, 2, 98, 217, 145, 128, 27, 147, 238, 225, 125, 210, 227, 32, 135, 7, 1,
  119, 84, 191, 152, 240, 6, 235, 83, 109, 36, 228, 34, 192, 11, 192, 157, 117,
  233, 176, 200, 223, 172, 117, 78, 162, 189, 124, 178, 212, 79, 164, 53, 62,
  50, 198, 147, 248, 208, 25, 154, 131, 231, 163, 174, 71, 216, 177,
];
let base58_wallet = bs58.encode(wallet).toString();
console.log(`base58 wallet is : ${base58_wallet}`);

const base58_string =
  "5KVAk9QqL4H1xDYJDHNxH6adue6QGLxvcjgfAd6vcyftRuzogqguXPxJKYKFrqtjMF9zB6nrjafwXgLSbimHFrSt";
let wallet1: Uint8Array = bs58.decode(base58_string);
console.log(`Wallet is : [${wallet1}]`);
