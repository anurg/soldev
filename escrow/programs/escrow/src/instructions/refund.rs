use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::Escrow;
#[derive(Accounts)]
#[instruction(seed:u64)]
pub struct Refund<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(mint::token_program=token_program)]
    pub mint_a: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint=mint_a,
        associated_token::authority=maker,
        associated_token::token_program=token_program
    )]
    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        close=maker,
        seeds=[b"escrow",seed.to_le_bytes().as_ref(),maker.key().as_ref()],
        bump=escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint=mint_a,
        associated_token::authority=escrow,
        associated_token::token_program=token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Refund<'info> {
    pub fn close_and_refund(&mut self, seed: u64) -> Result<()> {
        //Refund the tokens from Vault to maker_ata_a
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.maker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
        let seeds = &[
            b"escrow".as_ref(),
            &self.escrow.seed.to_le_bytes(),
            &[self.escrow.bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer_checked(cpi_context, self.vault.amount, self.mint_a.decimals)?;

        // Close Account
        let close_cpictx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.vault.to_account_info(),
                destination: self.maker.to_account_info(),
                authority: self.escrow.to_account_info(),
            },
            signer_seeds,
        );
        close_account(close_cpictx)?;
        Ok(())
    }
}
