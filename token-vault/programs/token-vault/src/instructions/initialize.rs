use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::VaultState;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer=maker,
        space=8 + VaultState::INIT_SPACE,
        seeds=[b"vault_state",maker.key().as_ref()],
        bump
    )]
    pub vault_state: Account<'info, VaultState>, //vault configuration
    #[account(
        init_if_needed,
        payer=maker,
        associated_token::mint=mint,
        associated_token::authority=vault_state,
        associated_token::token_program=token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>, //vault ATA
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
impl<'info> Initialize<'info> {
    pub fn init(&mut self, bumps: &InitializeBumps) -> Result<()> {
        self.vault_state.state_bump = bumps.vault_state;
        self.vault_state.mint = self.mint.key();
        Ok(())
    }
}
