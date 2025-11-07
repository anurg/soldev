use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer=admin,
        space = 8 + Marketplace::INIT_SPACE,
        seeds=[b"market",admin.key().as_ref()],
        bump,
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(
        seeds=[b"treasury",marketplace.key().as_ref()],
        bump
    )]
    pub treasury: SystemAccount<'info>,
    #[account(
        init,
        payer=admin,
        seeds=[b"rewards",marketplace.key().as_ref()],
        bump,
        mint::authority=marketplace,
        mint::decimals=6
    )]
    pub reward_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
