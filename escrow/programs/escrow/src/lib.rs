pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("F6qGchHVrmoAyaRiQzFiUoRRUj5xvKG1i7DefHNR8GWy");

#[program]
pub mod escrow {
    use super::*;

    pub fn make(
        ctx: Context<Make>,
        seed: u64,
        mint_a: Pubkey,
        mint_b: Pubkey,
        receive: u64,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts
            .init_escrow(seed, mint_a, mint_b, receive, ctx.bumps)?;
        ctx.accounts.deposit(amount)?;
        Ok(())
    }
    pub fn refund(ctx: Context<Refund>, seed: u64) -> Result<()> {
        ctx.accounts.close_and_refund(seed)?;
        Ok(())
    }
    pub fn take(ctx: Context<Take>, seed: u64) -> Result<()> {
        ctx.accounts.take(seed)?;
        Ok(())
    }
}
