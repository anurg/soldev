use litesvm::LiteSVM;
use solana_sdk::{
    signature::{Keypair, Signer},
    pubkey::Pubkey,
    transaction::Transaction,
    instruction::{Instruction, AccountMeta},
};
use std::path::PathBuf;
use anchor_lang::AnchorSerialize;

// System program ID
const SYSTEM_PROGRAM_ID: Pubkey = Pubkey::new_from_array([0; 32]);

/// Helper to convert anchor Pubkey to solana_sdk Pubkey
fn to_sdk_pubkey(anchor_pk: anchor_lang::prelude::Pubkey) -> Pubkey {
    Pubkey::new_from_array(anchor_pk.to_bytes())
}

// SPL Token Program ID: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
const TOKEN_PROGRAM_ID: Pubkey = Pubkey::new_from_array([
    6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172,
    28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169,
]);

// Associated Token Program ID: ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL
const ASSOCIATED_TOKEN_PROGRAM_ID: Pubkey = Pubkey::new_from_array([
    140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142, 13, 131,
    11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216, 219, 233, 248, 89,
]);

/// Get associated token address
fn get_associated_token_address(wallet: &Pubkey, mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[
            wallet.as_ref(),
            TOKEN_PROGRAM_ID.as_ref(),
            mint.as_ref(),
        ],
        &ASSOCIATED_TOKEN_PROGRAM_ID,
    ).0
}

/// Create instruction to initialize a mint
fn create_initialize_mint_instruction(
    mint: &Pubkey,
    mint_authority: &Pubkey,
    decimals: u8,
) -> Instruction {
    let mut data = vec![0u8]; // InitializeMint discriminator
    data.extend_from_slice(&decimals.to_le_bytes());
    data.extend_from_slice(mint_authority.as_ref());
    data.push(0); // freeze_authority = None
    
    Instruction {
        program_id: TOKEN_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(*mint, false),
            AccountMeta::new_readonly(solana_sdk::sysvar::rent::ID, false),
        ],
        data,
    }
}

/// Create instruction to initialize an account
fn create_initialize_account_instruction(
    account: &Pubkey,
    mint: &Pubkey,
    owner: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: TOKEN_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(*account, false),
            AccountMeta::new_readonly(*mint, false),
            AccountMeta::new_readonly(*owner, false),
            AccountMeta::new_readonly(solana_sdk::sysvar::rent::ID, false),
        ],
        data: vec![1], // InitializeAccount discriminator
    }
}

/// Create instruction to mint tokens
fn create_mint_to_instruction(
    mint: &Pubkey,
    destination: &Pubkey,
    authority: &Pubkey,
    amount: u64,
) -> Instruction {
    let mut data = vec![7]; // MintTo discriminator
    data.extend_from_slice(&amount.to_le_bytes());
    
    Instruction {
        program_id: TOKEN_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(*mint, false),
            AccountMeta::new(*destination, false),
            AccountMeta::new_readonly(*authority, true),
        ],
        data,
    }
}

/// Create instruction to create associated token account
fn create_associated_token_account_instruction(
    payer: &Pubkey,
    wallet: &Pubkey,
    mint: &Pubkey,
) -> Instruction {
    let associated_token_address = get_associated_token_address(wallet, mint);
    
    Instruction {
        program_id: ASSOCIATED_TOKEN_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(associated_token_address, false),
            AccountMeta::new_readonly(*wallet, false),
            AccountMeta::new_readonly(*mint, false),
            AccountMeta::new_readonly(SYSTEM_PROGRAM_ID, false),
            AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        ],
        data: vec![],
    }
}

#[test]
fn test_program_loads() {
    let mut svm = LiteSVM::new();
    
    // Load the token-vault program
    let program_id = to_sdk_pubkey(token_vault::ID);
    let mut so_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    so_path.push("../../target/deploy/token_vault.so");
    
    svm.add_program_from_file(program_id, &so_path).unwrap();
    
    println!("✓ Program loaded successfully");
    println!("  Program ID: {}", program_id);
    
    let program_account = svm.get_account(&program_id).unwrap();
    assert!(program_account.executable, "Program should be executable");
    println!("  Program owner: {}", program_account.owner);
    
    println!("✓ Program account verified");
    println!("  Executable: {}", program_account.executable);
    println!("  Data length: {} bytes", program_account.data.len());
}

#[test]
fn test_basic_setup() {
    let mut svm = LiteSVM::new();
    
    let program_id = to_sdk_pubkey(token_vault::ID);
    let mut so_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    so_path.push("../../target/deploy/token_vault.so");
    svm.add_program_from_file(program_id, &so_path).unwrap();
    
    let payer = Keypair::new();
    let initial_balance = 10_000_000_000;
    svm.airdrop(&payer.pubkey(), initial_balance).unwrap();
    
    let balance = svm.get_balance(&payer.pubkey()).unwrap();
    assert_eq!(balance, initial_balance);
    
    println!("✓ Test account created and funded");
    println!("  Payer: {}", payer.pubkey());
    println!("  Balance: {} lamports ({} SOL)", balance, balance as f64 / 1e9);
    
    let (vault_state, bump) = Pubkey::find_program_address(
        &[b"vault_state", payer.pubkey().as_ref()],
        &program_id,
    );
    
    println!("✓ PDA derivation works");
    println!("  Vault State PDA: {}", vault_state);
    println!("  Bump: {}", bump);
}

#[test]
fn test_instruction_data_construction() {
    // Initialize instruction (no args)
    let mut init_data = Vec::new();
    init_data.extend_from_slice(&[175, 175, 109, 31, 13, 152, 155, 237]);
    println!("✓ Initialize instruction data: {} bytes", init_data.len());
    
    // Deposit instruction (u64 amount)
    let deposit_amount: u64 = 1000;
    let mut deposit_data = Vec::new();
    deposit_data.extend_from_slice(&[242, 35, 198, 137, 82, 225, 242, 182]);
    deposit_amount.serialize(&mut deposit_data).unwrap();
    println!("✓ Deposit instruction data: {} bytes", deposit_data.len());
    
    // Withdraw instruction (u64 amount)
    let withdraw_amount: u64 = 500;
    let mut withdraw_data = Vec::new();
    withdraw_data.extend_from_slice(&[183, 18, 70, 156, 148, 109, 161, 34]);
    withdraw_amount.serialize(&mut withdraw_data).unwrap();
    println!("✓ Withdraw instruction data: {} bytes", withdraw_data.len());
    
    // Close instruction (no args)
    let mut close_data = Vec::new();
    close_data.extend_from_slice(&[98, 165, 201, 177, 108, 65, 206, 96]);
    println!("✓ Close instruction data: {} bytes", close_data.len());
    
    println!("\n🎉 All instruction data constructed successfully!");
}

#[test]
fn test_account_metas_construction() {
    let mut svm = LiteSVM::new();
    
    let program_id = to_sdk_pubkey(token_vault::ID);
    let mut so_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    so_path.push("../../target/deploy/token_vault.so");
    svm.add_program_from_file(program_id, &so_path).unwrap();
    
    let payer = Keypair::new();
    let mint = Keypair::new();
    
    let (vault_state, _) = Pubkey::find_program_address(
        &[b"vault_state", payer.pubkey().as_ref()],
        &program_id,
    );
    
    let payer_ata = Pubkey::new_unique();
    let vault_ata = Pubkey::new_unique();
    
    let system_program_id = to_sdk_pubkey(anchor_lang::system_program::ID);
    
    // Initialize accounts
    let init_accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(system_program_id, false),
    ];
    
    println!("✓ Initialize accounts: {} account metas", init_accounts.len());
    
    // Deposit accounts
    let deposit_accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(payer_ata, false),
        AccountMeta::new_readonly(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(system_program_id, false),
    ];
    
    println!("✓ Deposit accounts: {} account metas", deposit_accounts.len());
    
    assert_eq!(init_accounts.len(), 7, "Initialize should have 7 accounts");
    assert_eq!(deposit_accounts.len(), 8, "Deposit should have 8 accounts");
    
    println!("\n🎉 All account metas constructed successfully!");
}

#[test]
fn test_initialize_vault() {
    let mut svm = LiteSVM::new();
    
    // Load program
    let program_id = to_sdk_pubkey(token_vault::ID);
    let mut so_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    so_path.push("../../target/deploy/token_vault.so");
    svm.add_program_from_file(program_id, &so_path).unwrap();
    
    // Setup payer
    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
    
    // Create mint
    let mint = Keypair::new();
    let mint_authority = Keypair::new();
    let decimals = 6;
    
    // Create mint account
    let mint_rent = svm.minimum_balance_for_rent_exemption(82);
    
    // Manually create system_instruction::create_account
    let mut data = vec![0u8; 4 + 8 + 8 + 32]; // discriminator + lamports + space + owner
    data[0..4].copy_from_slice(&0u32.to_le_bytes()); // CreateAccount discriminator
    data[4..12].copy_from_slice(&mint_rent.to_le_bytes());
    data[12..20].copy_from_slice(&82u64.to_le_bytes());
    data[20..52].copy_from_slice(TOKEN_PROGRAM_ID.as_ref());
    
    let create_mint_ix = Instruction {
        program_id: SYSTEM_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(payer.pubkey(), true),
            AccountMeta::new(mint.pubkey(), true),
        ],
        data,
    };
    
    let init_mint_ix = create_initialize_mint_instruction(
        &mint.pubkey(),
        &mint_authority.pubkey(),
        decimals,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[create_mint_ix, init_mint_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    println!("✓ Mint created: {}", mint.pubkey());
    
    // Create payer ATA
    let payer_ata = get_associated_token_address(&payer.pubkey(), &mint.pubkey());
    let create_ata_ix = create_associated_token_account_instruction(
        &payer.pubkey(),
        &payer.pubkey(),
        &mint.pubkey(),
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[create_ata_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    println!("✓ Payer ATA created: {}", payer_ata);
    
    // Mint some tokens
    let mint_amount = 1000 * 1_000_000;
    let mint_to_ix = create_mint_to_instruction(
        &mint.pubkey(),
        &payer_ata,
        &mint_authority.pubkey(),
        mint_amount,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[mint_to_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint_authority],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    println!("✓ Minted {} tokens to payer ATA", mint_amount);
    
    // Initialize vault
    let (vault_state, _bump) = Pubkey::find_program_address(
        &[b"vault_state", payer.pubkey().as_ref()],
        &program_id,
    );
    
    let vault_ata = get_associated_token_address(&vault_state, &mint.pubkey());
    
    let accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(to_sdk_pubkey(anchor_lang::system_program::ID), false),
    ];
    
    let mut data = Vec::new();
    data.extend_from_slice(&[175, 175, 109, 31, 13, 152, 155, 237]); // initialize discriminator
    
    let ix = Instruction {
        program_id,
        accounts,
        data,
    };
    
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    
    let result = svm.send_transaction(tx);
    
    match result {
        Ok(_) => {
            println!("✓ Vault initialized successfully");
            
            // Verify vault state account exists
            let vault_state_account = svm.get_account(&vault_state).unwrap();
            assert_eq!(vault_state_account.owner, program_id);
            println!("  Vault state PDA: {}", vault_state);
            println!("  Vault ATA: {}", vault_ata);
            
            // Verify vault ATA exists
            let vault_ata_account = svm.get_account(&vault_ata);
            assert!(vault_ata_account.is_some(), "Vault ATA should exist");
            println!("✓ Vault ATA created");
        }
        Err(e) => {
            println!("✗ Vault initialization failed: {:?}", e);
            panic!("Vault initialization failed");
        }
    }
}

/// Helper function to get token account balance
fn get_token_balance(svm: &LiteSVM, token_account: &Pubkey) -> u64 {
    let account = svm.get_account(token_account).unwrap();
    // Token account data layout: amount is at bytes 64-72 (u64 little-endian)
    u64::from_le_bytes(account.data[64..72].try_into().unwrap())
}

#[test]
fn test_deposit_tokens() {
    let mut svm = LiteSVM::new();
    
    // Load program
    let program_id = to_sdk_pubkey(token_vault::ID);
    let mut so_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    so_path.push("../../target/deploy/token_vault.so");
    svm.add_program_from_file(program_id, &so_path).unwrap();
    
    // Setup payer
    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
    
    // Create mint and mint tokens
    let mint = Keypair::new();
    let mint_authority = Keypair::new();
    let decimals = 6;
    
    let mint_rent = svm.minimum_balance_for_rent_exemption(82);
    let mut data = vec![0u8; 4 + 8 + 8 + 32];
    data[0..4].copy_from_slice(&0u32.to_le_bytes());
    data[4..12].copy_from_slice(&mint_rent.to_le_bytes());
    data[12..20].copy_from_slice(&82u64.to_le_bytes());
    data[20..52].copy_from_slice(TOKEN_PROGRAM_ID.as_ref());
    
    let create_mint_ix = Instruction {
        program_id: SYSTEM_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(payer.pubkey(), true),
            AccountMeta::new(mint.pubkey(), true),
        ],
        data,
    };
    
    let init_mint_ix = create_initialize_mint_instruction(
        &mint.pubkey(),
        &mint_authority.pubkey(),
        decimals,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[create_mint_ix, init_mint_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    // Create payer ATA and mint tokens
    let payer_ata = get_associated_token_address(&payer.pubkey(), &mint.pubkey());
    let create_ata_ix = create_associated_token_account_instruction(
        &payer.pubkey(),
        &payer.pubkey(),
        &mint.pubkey(),
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[create_ata_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    let initial_amount = 1000 * 1_000_000;
    let mint_to_ix = create_mint_to_instruction(
        &mint.pubkey(),
        &payer_ata,
        &mint_authority.pubkey(),
        initial_amount,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[mint_to_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint_authority],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    println!("✓ Initial setup complete");
    println!("  Payer ATA balance: {}", initial_amount);
    
    // Initialize vault
    let (vault_state, _bump) = Pubkey::find_program_address(
        &[b"vault_state", payer.pubkey().as_ref()],
        &program_id,
    );
    let vault_ata = get_associated_token_address(&vault_state, &mint.pubkey());
    
    let init_accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(to_sdk_pubkey(anchor_lang::system_program::ID), false),
    ];
    
    let mut init_data = Vec::new();
    init_data.extend_from_slice(&[175, 175, 109, 31, 13, 152, 155, 237]);
    
    let init_ix = Instruction {
        program_id,
        accounts: init_accounts,
        data: init_data,
    };
    
    let tx = Transaction::new_signed_with_payer(
        &[init_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    println!("✓ Vault initialized");
    
    // Deposit tokens
    let deposit_amount = 250 * 1_000_000;
    
    let deposit_accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(payer_ata, false),
        AccountMeta::new_readonly(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(to_sdk_pubkey(anchor_lang::system_program::ID), false),
    ];
    
    let mut deposit_data = Vec::new();
    deposit_data.extend_from_slice(&[242, 35, 198, 137, 82, 225, 242, 182]); // deposit discriminator
    deposit_amount.serialize(&mut deposit_data).unwrap();
    
    let deposit_ix = Instruction {
        program_id,
        accounts: deposit_accounts,
        data: deposit_data,
    };
    
    let tx = Transaction::new_signed_with_payer(
        &[deposit_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    
    let result = svm.send_transaction(tx);
    
    match result {
        Ok(_) => {
            println!("✓ Deposit successful");
            
            // Verify balances
            let payer_balance = get_token_balance(&svm, &payer_ata);
            let vault_balance = get_token_balance(&svm, &vault_ata);
            
            assert_eq!(payer_balance, initial_amount - deposit_amount, "Payer balance should decrease");
            assert_eq!(vault_balance, deposit_amount, "Vault balance should increase");
            
            println!("  Payer ATA balance: {} (decreased by {})", payer_balance, deposit_amount);
            println!("  Vault ATA balance: {}", vault_balance);
        }
        Err(e) => {
            println!("✗ Deposit failed: {:?}", e);
            panic!("Deposit failed");
        }
    }
}


#[test]
fn test_full_workflow() {
    let mut svm = LiteSVM::new();
    
    // Load program
    let program_id = to_sdk_pubkey(token_vault::ID);
    let mut so_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    so_path.push("../../target/deploy/token_vault.so");
    svm.add_program_from_file(program_id, &so_path).unwrap();
    
    // Setup payer
    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
    
    // Create mint
    let mint = Keypair::new();
    let mint_authority = Keypair::new();
    let decimals = 6;
    
    let mint_rent = svm.minimum_balance_for_rent_exemption(82);
    let mut data = vec![0u8; 4 + 8 + 8 + 32];
    data[0..4].copy_from_slice(&0u32.to_le_bytes());
    data[4..12].copy_from_slice(&mint_rent.to_le_bytes());
    data[12..20].copy_from_slice(&82u64.to_le_bytes());
    data[20..52].copy_from_slice(TOKEN_PROGRAM_ID.as_ref());
    
    let create_mint_ix = Instruction {
        program_id: SYSTEM_PROGRAM_ID,
        accounts: vec![
            AccountMeta::new(payer.pubkey(), true),
            AccountMeta::new(mint.pubkey(), true),
        ],
        data,
    };
    
    let init_mint_ix = create_initialize_mint_instruction(
        &mint.pubkey(),
        &mint_authority.pubkey(),
        decimals,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[create_mint_ix, init_mint_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    // Create payer ATA and mint tokens
    let payer_ata = get_associated_token_address(&payer.pubkey(), &mint.pubkey());
    let create_ata_ix = create_associated_token_account_instruction(
        &payer.pubkey(),
        &payer.pubkey(),
        &mint.pubkey(),
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[create_ata_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    let initial_amount = 1000 * 1_000_000;
    let mint_to_ix = create_mint_to_instruction(
        &mint.pubkey(),
        &payer_ata,
        &mint_authority.pubkey(),
        initial_amount,
    );
    
    let tx = Transaction::new_signed_with_payer(
        &[mint_to_ix],
        Some(&payer.pubkey()),
        &[&payer, &mint_authority],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    println!("✓ Setup complete - minted {} tokens", initial_amount);
    
    // Initialize vault
    let (vault_state, _bump) = Pubkey::find_program_address(
        &[b"vault_state", payer.pubkey().as_ref()],
        &program_id,
    );
    let vault_ata = get_associated_token_address(&vault_state, &mint.pubkey());
    
    let init_accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(to_sdk_pubkey(anchor_lang::system_program::ID), false),
    ];
    
    let mut init_data = Vec::new();
    init_data.extend_from_slice(&[175, 175, 109, 31, 13, 152, 155, 237]);
    
    let init_ix = Instruction {
        program_id,
        accounts: init_accounts,
        data: init_data,
    };
    
    let tx = Transaction::new_signed_with_payer(
        &[init_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    println!("✓ Vault initialized");
    
    // Deposit tokens
    let deposit_amount = 400 * 1_000_000;
    
    let deposit_accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(payer_ata, false),
        AccountMeta::new_readonly(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(to_sdk_pubkey(anchor_lang::system_program::ID), false),
    ];
    
    let mut deposit_data = Vec::new();
    deposit_data.extend_from_slice(&[242, 35, 198, 137, 82, 225, 242, 182]);
    deposit_amount.serialize(&mut deposit_data).unwrap();
    
    let deposit_ix = Instruction {
        program_id,
        accounts: deposit_accounts,
        data: deposit_data,
    };
    
    let tx = Transaction::new_signed_with_payer(
        &[deposit_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx).unwrap();
    
    let payer_balance_after_deposit = get_token_balance(&svm, &payer_ata);
    let vault_balance_after_deposit = get_token_balance(&svm, &vault_ata);
    
    println!("✓ Deposited {} tokens", deposit_amount);
    println!("  Payer balance: {}", payer_balance_after_deposit);
    println!("  Vault balance: {}", vault_balance_after_deposit);
    
    assert_eq!(payer_balance_after_deposit, initial_amount - deposit_amount);
    assert_eq!(vault_balance_after_deposit, deposit_amount);
    
    // Withdraw tokens
    let withdraw_amount = 150 * 1_000_000;
    
    let withdraw_accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(payer_ata, false),
        AccountMeta::new_readonly(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(to_sdk_pubkey(anchor_lang::system_program::ID), false),
    ];
    
    let mut withdraw_data = Vec::new();
    withdraw_data.extend_from_slice(&[183, 18, 70, 156, 148, 109, 161, 34]);
    withdraw_amount.serialize(&mut withdraw_data).unwrap();
    
    let withdraw_ix = Instruction {
        program_id,
        accounts: withdraw_accounts,
        data: withdraw_data,
    };
    
    let tx = Transaction::new_signed_with_payer(
        &[withdraw_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    
    let result = svm.send_transaction(tx);
    match &result {
        Ok(_) => println!("✓ Withdraw successful"),
        Err(e) => {
            println!("✗ Withdraw failed: {:?}", e);
            panic!("Withdraw failed");
        }
    }
    
    let payer_balance_after_withdraw = get_token_balance(&svm, &payer_ata);
    let vault_balance_after_withdraw = get_token_balance(&svm, &vault_ata);
    
    println!("  Payer balance after withdraw: {}", payer_balance_after_withdraw);
    println!("  Vault balance after withdraw: {}", vault_balance_after_withdraw);
    
    assert_eq!(payer_balance_after_withdraw, payer_balance_after_deposit + withdraw_amount);
    assert_eq!(vault_balance_after_withdraw, vault_balance_after_deposit - withdraw_amount);
    
    // Close vault
    let close_accounts = vec![
        AccountMeta::new(payer.pubkey(), true),
        AccountMeta::new_readonly(mint.pubkey(), false),
        AccountMeta::new(payer_ata, false),
        AccountMeta::new(vault_state, false),
        AccountMeta::new(vault_ata, false),
        AccountMeta::new_readonly(TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(ASSOCIATED_TOKEN_PROGRAM_ID, false),
        AccountMeta::new_readonly(to_sdk_pubkey(anchor_lang::system_program::ID), false),
    ];
    
    let mut close_data = Vec::new();
    close_data.extend_from_slice(&[98, 165, 201, 177, 108, 65, 206, 96]);
    
    let close_ix = Instruction {
        program_id,
        accounts: close_accounts,
        data: close_data,
    };
    
    let tx = Transaction::new_signed_with_payer(
        &[close_ix],
        Some(&payer.pubkey()),
        &[&payer],
        svm.latest_blockhash(),
    );
    
    let result = svm.send_transaction(tx);
    match &result {
        Ok(_) => println!("✓ Close successful"),
        Err(e) => {
            println!("✗ Close failed: {:?}", e);
            panic!("Close failed");
        }
    }
    
    let final_payer_balance = get_token_balance(&svm, &payer_ata);
    
    println!("  Final payer balance: {}", final_payer_balance);
    
    // Verify payer received all remaining vault tokens
    assert_eq!(final_payer_balance, payer_balance_after_withdraw + vault_balance_after_withdraw);
    
    // Verify vault state is closed
    let vault_state_account = svm.get_account(&vault_state);
    assert!(vault_state_account.is_none() || vault_state_account.unwrap().lamports == 0,
        "Vault state should be closed");
    
    println!("✓ Vault state closed");
    
    // Verify vault ATA is closed
    let vault_ata_account = svm.get_account(&vault_ata);
    assert!(vault_ata_account.is_none() || vault_ata_account.unwrap().lamports == 0,
        "Vault ATA should be closed");
    
    println!("✓ Vault ATA closed");
    println!("\n🎉 Full workflow test passed: initialize → deposit → withdraw → close");
}
