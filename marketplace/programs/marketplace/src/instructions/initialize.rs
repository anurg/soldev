use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};
#[derive(Accounts)]
pub struct Initialize<'info> {
    pub admin: Signer<'info>,
    pub marketplace: Account<'info, Marketplace>,
    pub treasury: SystemAccount<'info>,
    pub reward_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
