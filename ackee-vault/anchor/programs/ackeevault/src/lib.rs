pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("42VY2mEV4gUz31qPaT5oAHFojXQE9tWAEwfdAf6w5rxL");

#[program]
pub mod ackeevault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, vault_id: u16) -> Result<()> {
        msg!(
            "initialize vault.owner-{:?}-lamports-{}",
            ctx.accounts.vault.to_account_info().owner,
            ctx.accounts.vault.to_account_info().lamports()
        );
        ctx.accounts.handler(vault_id, &ctx.bumps)
    }
    pub fn deposit(ctx: Context<Deposit>, vault_id: u16, amount: u64) -> Result<()> {
        ctx.accounts.deposit(vault_id, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, vault_id: u16, amount: u64) -> Result<()> {
        ctx.accounts.withdraw(vault_id, amount)
    }
    pub fn close(ctx: Context<Close>, vault_id: u16) -> Result<()> {
        ctx.accounts.close(vault_id)
    }
}
