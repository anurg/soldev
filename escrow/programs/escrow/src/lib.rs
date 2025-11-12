pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("2wEGsaYr6qRVG1MBkbATSHeJ7EMmxNVUV8mf2JVSc2hg");

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
}
