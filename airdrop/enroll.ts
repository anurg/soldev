import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithinSizeLimit,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  getBase64EncodedWireTransaction,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  addSignersToTransactionMessage,
  getProgramDerivedAddress,
  generateKeyPairSigner,
  getAddressEncoder,
} from "@solana/kit";
import wallet from "./dev-wallet.json";
import {
  getInitializeInstruction,
  getSubmitTsInstruction,
} from "./clients/js/src/generated/index";

const MPL_CORE_PROGRAM = address(
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
);
const PROGRAM_ADDRESS = address("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM");
const SYSTEM_PROGRAM = address("11111111111111111111111111111111");

const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(
  devnet("ws://api.devnet.solana.com")
);

const addressEncoder = getAddressEncoder();
// Create the PDA for enrollment account
const accountSeeds = [
  Buffer.from("prereqs"),
  addressEncoder.encode(keypair.address),
];
const [account, _bump] = await getProgramDerivedAddress({
  programAddress: PROGRAM_ADDRESS,
  seeds: accountSeeds,
});

const COLLECTION = address("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");

// Generate mint keypair for the NFT
const mintKeyPair = await generateKeyPairSigner();

//PDA for mint
const mintAccountsSeeds = [
  Buffer.from("collection"),
  addressEncoder.encode(COLLECTION),
];
const [authority, _bump1] = await getProgramDerivedAddress({
  programAddress: PROGRAM_ADDRESS,
  seeds: mintAccountsSeeds,
});
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// const initializeIx = getInitializeInstruction({
//   github: "test",
//   user: keypair,
//   account,
//   systemProgram: SYSTEM_PROGRAM,
// });
// const transactionMessageInit = pipe(
//   createTransactionMessage({ version: 0 }),
//   (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
//   (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
//   (tx) => appendTransactionMessageInstructions([initializeIx], tx)
// );
// const signedTxInit = await signTransactionMessageWithSigners(
//   transactionMessageInit
// );

// assertIsTransactionWithinSizeLimit(signedTxInit);
// const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
//   rpc,
//   rpcSubscriptions,
// });
// try {
//   const result = await sendAndConfirmTransaction(signedTxInit, {
//     commitment: "confirmed",
//     skipPreflight: false,
//   });
//   console.log(result);
//   const signatureInit = getSignatureFromTransaction(signedTxInit);
//   console.log(
//     `Success! Check out your TX here: https://explorer.solana.com/tx/${signatureInit}?cluster=devnet`
//   );
// } catch (e) {
//   console.error(`Oops, something went wrong: ${e}`);
// }

const submitIx = getSubmitTsInstruction({
  user: keypair,
  account,
  mint: mintKeyPair,
  collection: COLLECTION,
  authority,
  mplCoreProgram: MPL_CORE_PROGRAM,
  systemProgram: SYSTEM_PROGRAM,
});

const transactionMessageSubmit = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([submitIx], tx),
  (tx) => addSignersToTransactionMessage([mintKeyPair], tx)

  // Add mint as additional signer after appending instructions
);
const signedTxSubmit = await signTransactionMessageWithSigners(
  transactionMessageSubmit
);
assertIsTransactionWithinSizeLimit(signedTxSubmit);
const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
  rpc,
  rpcSubscriptions,
});
try {
  await sendAndConfirmTransaction(signedTxSubmit, {
    commitment: "confirmed",
    skipPreflight: false,
  });
  const signatureSubmit = getSignatureFromTransaction(signedTxSubmit);
  console.log(
    `Success! Check out your TX here: https://explorer.solana.com/tx/${signatureSubmit}?cluster=devnet`
  );
} catch (e) {
  console.error(`Oops, something went wrong: ${e}`);
}

// //// To get the logs, simulate Transaction
// const base64TxInit = getBase64EncodedWireTransaction(signedTxSubmit);
// const simInit = await rpc
//   .simulateTransaction(base64TxInit, { encoding: "base64" })
//   .send();
// if (simInit.value.err) {
//   console.error("Simulation failed for initialize TX");
//   console.log(simInit);
//   if (simInit.value.logs) {
//     console.log("Simulation Logs:");
//     simInit.value.logs.forEach((log: string) => console.log(log));
//   } else {
//     console.log("No simulation logs available.");
//   }
// } else {
//   console.log("Simulation succeeded for initialize TX");
// }
// //// To get the logs
