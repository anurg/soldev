import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "/home/nkb/.config/solana/id.json";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

const mint = publicKey("4qfeY1nNan6A5ekyj6RaVZxHxxoZRAQVbeYQAPoFCVZV");
// Add the mplTokenMetadata plugin here

const umi = createUmi("https://api.devnet.solana.com");
const keypair = umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(wallet));
console.log(`keypair - ${keypair.publicKey}`);
const signer = createSignerFromKeypair(umi, keypair);
// umi.use(signerIdentity(signer));
umi.use(signerIdentity(signer)).use(mplTokenMetadata());
(async () => {
  //   try {
  // Start here
  let accounts: CreateMetadataAccountV3InstructionAccounts = {
    mint: mint,
    mintAuthority: signer,
  };
  // let accounts: CreateMetadataAccountV3InstructionAccounts = {
  //     ???
  // }
  let data: DataV2Args = {
    name: "NKB",
    symbol: "NKB",
    uri: "https://raw.githubusercontent.com/anurg/TurbinePB_Q425_anurg/refs/heads/main/nkb.json",
    creators: null,
    sellerFeeBasisPoints: 0,
    uses: null,
    collection: null,
  };
  // let data: DataV2Args = {
  //     ???
  // }
  let args: CreateMetadataAccountV3InstructionArgs = {
    data,
    isMutable: true,
    collectionDetails: null,
  };
  // let args: CreateMetadataAccountV3InstructionArgs = {
  //     ???
  // }
  let tx = createMetadataAccountV3(umi, { ...accounts, ...args });
  // let tx = createMetadataAccountV3(
  //     umi,
  //     {
  //         ...accounts,
  //         ...args
  //     }
  // )
  let result = await tx.sendAndConfirm(umi);
  // let result = await tx.sendAndConfirm(umi);
  // console.log(bs58.encode(result.signature));
  console.log(bs58.encode(result.signature));
  //   } catch (e) {
  //     console.log(`Some error-${e}`);
  //   }
})();
