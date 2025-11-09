use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]

pub struct VaultState {
    pub vault_id: u16,
    pub vault_bump: u8,
    pub state_bump: u8,
}
