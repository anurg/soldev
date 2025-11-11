use anchor_lang::prelude::*;

#[event]
pub struct InitializeEvent {
    pub mint: Pubkey,
    pub vault: Pubkey,
}
#[event]
pub struct DepositEvent {
    pub amount: u64,
    pub vault: Pubkey,
    pub maker: Pubkey,
}
#[event]
pub struct WithdrawEvent {
    pub amount: u64,
    pub vault: Pubkey,
    pub maker: Pubkey,
}
#[event]
pub struct CloseEvent {
    pub maker_ata: Pubkey,
    pub vault: Pubkey,
    pub maker: Pubkey,
    pub mint: Pubkey,
}
