use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, token_interface::{Mint, TokenAccount, TokenInterface,TransferChecked,transfer_checked}
};

use crate::VaultState;
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut, 
        associated_token::mint=mint,
        associated_token::authority=maker,
        associated_token::token_program=token_program
    )]
    pub maker_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        seeds=[b"vault_state",maker.key().as_ref()],
        bump=vault_state.state_bump
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        associated_token::mint=mint,
        associated_token::authority=vault_state,
        associated_token::token_program=token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn deposit(&mut self,amount:u64)->Result<()> {
        // CPI to transfer tokens from maker_ata to vault
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from:self.maker_ata.to_account_info(),
            to:self.vault.to_account_info(),
            mint:self.mint.to_account_info(),
            authority:self.maker.to_account_info()
        };
        let cpi_context = CpiContext::new(cpi_program,cpi_accounts);
        transfer_checked(cpi_context, amount, self.mint.decimals)?;
        Ok(())
    }
}