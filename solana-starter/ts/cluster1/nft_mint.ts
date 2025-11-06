import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "/home/nkb/.config/solana/id.json";
import {
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity,
  UmiError,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplTokenMetadata());
const mint = generateSigner(umi);
(async () => {
  try {
    let tx = createNft(umi, {
      mint,
      name: "Witch on Solana",
      uri: "https://gateway.irys.xyz/BzgZh5n7Q9a6RKEWABnPWXCgCmRgcMNzkCG7JU7ztR3e",
      sellerFeeBasisPoints: percentAmount(5),
    });
    let result = await tx.sendAndConfirm(umi);
    const signature = bs58.encode(result.signature);
    console.log(
      `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    // let tx = ???
    // let result = await tx.sendAndConfirm(umi);
    // const signature = base58.encode(result.signature);

    // console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);
  } catch (e) {
    console.log(`some error -${e}`);
  }
})();

// Succesfully Minted! Check out your TX here:
// https://explorer.solana.com/tx/4qmNYv14miGiJWmV8M7N2ZVVucyYTprxP51T5zkeHHZJXpYZ9jSQXoBL6CbU2M6pWXuzsqC9vL8jLsxZM84rfqf5?cluster=devnet
// Mint Address:  DoFgr6u1eqXGe9EBt99YkTgdZ1G4HL3XvVYqytBb851w
