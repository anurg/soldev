import {
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionWithinSizeLimit,
  compileTransaction,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import wallet from "./dev-wallet.json";

const LAMPORTS_PER_SOL = BigInt(1_000_000_000);
const keypair = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

const turbin3Wallet = address("FbbiXQcEzwSw8MSiNCmUHQ3DsZ93zFYhSuXua1RQ4WKg");

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const rpcSubscriptions = createSolanaRpcSubscriptions(
  devnet("ws://api.devnet.solana.com")
);

// const transferInstruction = getTransferSolInstruction({
//   source: keypair,
//   destination: turbin3Wallet,
//   amount: lamports(1n * LAMPORTS_PER_SOL),
// });
// const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
// const transactionMessage = pipe(
//   createTransactionMessage({ version: 0 }),
//   (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
//   (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
//   (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
// );

// const signedTransaction = await signTransactionMessageWithSigners(
//   transactionMessage
// );
// assertIsTransactionWithinSizeLimit(signedTransaction);

// const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
//   rpc,
//   rpcSubscriptions,
// });
// try {
//   await sendAndConfirmTransaction(signedTransaction, {
//     commitment: "confirmed",
//   });
//   const signature = getSignatureFromTransaction(signedTransaction);
//   console.log(
//     `Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`
//   );
// } catch (e) {
//   console.error("Transfer failed:", e);
// }
//first get the balance from our wallet
const { value: balance } = await rpc.getBalance(keypair.address).send();
console.log(`Balance is : ${balance}`);
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const dummyTransferInstruction = await getTransferSolInstruction({
  source: keypair,
  destination: turbin3Wallet,
  amount: lamports(0n),
});
const dummyTransactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([dummyTransferInstruction], tx)
);

const complileDummy = compileTransaction(dummyTransactionMessage);
const dummyMessageBase64 = Buffer.from(complileDummy.messageBytes).toString(
  "base64"
) as TransactionMessageBytesBase64;

const { value: fee } =
  (await rpc.getFeeForMessage(dummyMessageBase64).send()) || 0n;

if (fee === null) {
  throw new Error(`Unable to calculate transaction fee`);
}
if (balance < fee) {
  throw new Error(
    `Insufficient Balance to cover the transaction fees. Balance: ${balance}, Fee: ${fee}`
  );
}
const sendAmount = balance - fee;
console.log(`Send Amount after fees is : ${sendAmount}`);

const transferInstruction = getTransferSolInstruction({
  source: keypair,
  destination: turbin3Wallet,
  amount: lamports(sendAmount),
});

const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(keypair, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
);

const signedTransaction = await signTransactionMessageWithSigners(
  transactionMessage
);
assertIsTransactionWithinSizeLimit(signedTransaction);

const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
  rpc,
  rpcSubscriptions,
});
try {
  await sendAndConfirmTransaction(signedTransaction, {
    commitment: "confirmed",
  });
  const signature = getSignatureFromTransaction(signedTransaction);
  console.log(
    `Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`
  );
} catch (e) {
  console.error("Transfer failed:", e);
}
