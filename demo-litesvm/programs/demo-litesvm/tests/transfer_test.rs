use litesvm::LiteSVM;
use serde_json;
use solana_sdk::{
    native_token::LAMPORTS_PER_SOL, signature::Keypair, signer::Signer, system_instruction,
    transaction::Transaction,
};

#[test]
pub fn transfer_test() {
    let mut svm = LiteSVM::new();
    let alice = Keypair::new();
    let bob = Keypair::new();

    let result = svm.airdrop(&alice.pubkey(), 2 * LAMPORTS_PER_SOL);
    match result {
        Ok(tx) => println!("Transaction Details- {tx:?}"),
        Err(e) => println!("Some Error-{e:?}"),
    }
    let ix = system_instruction::transfer(&alice.pubkey(), &bob.pubkey(), 1 * LAMPORTS_PER_SOL);
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&alice.pubkey()),
        &[&alice],
        svm.latest_blockhash(),
    );

    svm.send_transaction(tx).unwrap();
    assert_eq!(
        svm.get_balance(&bob.pubkey()).unwrap(),
        1 * LAMPORTS_PER_SOL
    );
    assert!(svm.get_balance(&alice.pubkey()).unwrap() < 1 * LAMPORTS_PER_SOL);
}
