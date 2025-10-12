import {compressTransactionMessageUsingAddressLookupTables, createKeyPairSignerFromBytes, generateKeyPair, generateKeyPairSigner} from "@solana/kit";
import { verify } from "crypto";

const keypair = await crypto.subtle.generateKey({name:"Ed25519"},true,["sign","verify"]);
const privateKeyJwk = await crypto.subtle.exportKey("jwk",keypair.privateKey);
const privateKeyBase64 = privateKeyJwk.d;
if (!privateKeyBase64) {
    throw new Error('Failed to get Private key Bytes');
}

const privateKeyBytes = new Uint8Array(Buffer.from(privateKeyBase64,'base64'));
const publicKeyBytes = new Uint8Array(await crypto.subtle.exportKey('raw',keypair.publicKey));
const keypairBytes = new Uint8Array([...privateKeyBytes,...publicKeyBytes]);
const signer = await createKeyPairSignerFromBytes(keypairBytes);
console.log(`You have generated a new solana wallet: ${signer.address}`);
console.log(`To save your wallet, copy and paste into a JSON file: [${keypairBytes}]`)
