#[cfg(test)]
mod tests {
    use bs58;
    use solana_sdk::signature::{Keypair, Signer};
    use std::io::{self, BufRead};

    #[test]
    fn keygen() {
        use solana_sdk::signature::{Keypair, Signer};
        let kp = Keypair::new();
        println!("You have generated a new Solana wallet: {}", kp.pubkey());
        println!("TO save your wallet, copy & paste into a JSON file");
        println!("{:?}", kp.to_bytes());
    }

    #[test]
    fn base58_to_wallet() {}

    #[test]
    fn wallet_to_base58() {}

    #[test]
    fn claim_airdrop() {}

    #[test]
    fn transfer_sol() {}
}
