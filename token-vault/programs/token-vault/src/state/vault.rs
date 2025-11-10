use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VaultState {
    pub mint: Pubkey,
    pub state_bump: u8,
}
