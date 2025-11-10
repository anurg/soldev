use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface,TransferChecked,transfer_checked,CloseAccount,close_account},
};

use crate::VaultState;
#[derive(Accounts)]
pub struct Close<'info> {
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
        mut,
        close=maker,
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

impl<'info> Close<'info> {
    pub fn close(&mut self)->Result<()> {
        // CPI to transfer vault balance to maker_ata
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from:self.vault.to_account_info(),
            to:self.maker_ata.to_account_info(),
            mint:self.mint.to_account_info(),
            authority:self.vault_state.to_account_info()
        };
        let seeds = &[b"vault_state".as_ref(),
                  self.maker.to_account_info().key.as_ref(),
                  &[self.vault_state.state_bump]   
                ];
        let signer_seeds=&[&seeds[..]];
        let cpi_context = CpiContext::new_with_signer(cpi_program,cpi_accounts,signer_seeds);
        transfer_checked(cpi_context, self.vault.amount, self.mint.decimals)?;
        //Close Vault Account
        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination:self.maker_ata.to_account_info(),
            authority: self.vault_state.to_account_info(),
        };
        let close_context = CpiContext::new_with_signer(self.token_program.to_account_info(), close_accounts, signer_seeds);
        close_account(close_context)?;
        Ok(())
    }
}