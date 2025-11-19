use litesvm::LiteSVM;
use solana_sdk::{native_token::LAMPORTS_PER_SOL, signature::Keypair, signer::Signer};

#[test]
pub fn create_account() {
    let mut svm = LiteSVM::new();
    let alice = Keypair::new();

    let result = svm.airdrop(&alice.pubkey(), 2 * LAMPORTS_PER_SOL);
    match result {
        Ok(x) => println!("Airdrop Done!-{x:?}"),
        Err(e) => println!("Some Error- {e:?}"),
    }
    if let Some(balance) = svm.get_balance(&alice.pubkey()) {
        println!("The Balace of alice is - {balance}");
        assert_eq!(balance, 2 * LAMPORTS_PER_SOL);
    }
}
