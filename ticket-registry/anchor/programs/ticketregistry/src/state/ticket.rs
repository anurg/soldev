use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Ticket {
    pub event: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
}
