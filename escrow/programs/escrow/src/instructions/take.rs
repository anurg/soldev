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
pub struct Take<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mint::token_program=token_program)]
    pub mint_a: InterfaceAccount<'info, Mint>,
    #[account(mint::token_program=token_program)]
    pub mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer=taker,
        associated_token::mint=mint_b,
        associated_token::authority=maker,
        associated_token::token_program=token_program
    )]
    pub maker_ata_b: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer=taker,
        associated_token::mint=mint_a,
        associated_token::authority=taker,
        associated_token::token_program=token_program
    )]
    pub taker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint=mint_b,
        associated_token::authority=taker,
        associated_token::token_program=token_program
    )]
    pub taker_ata_b: InterfaceAccount<'info, TokenAccount>,
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

impl<'info> Take<'info> {
    pub fn take(&mut self, seed: u64) -> Result<()> {
        //Transfer token mint_b from taker ata_b to maker_ata_b
        let cpi_trf_context = CpiContext::new(
            self.token_program.to_account_info(),
            TransferChecked {
                from: self.taker_ata_b.to_account_info(),
                to: self.maker_ata_b.to_account_info(),
                mint: self.mint_b.to_account_info(),
                authority: self.taker.to_account_info(),
            },
        );
        transfer_checked(cpi_trf_context, self.escrow.receive, self.mint_b.decimals)?;
        //Transfer token mint_a from vault to taker_ata_a
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.taker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
        let seeds = &[
            b"escrow".as_ref(),
            &self.escrow.seed.to_le_bytes(),
            self.maker.to_account_info().key.as_ref(),
            &[self.escrow.bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer_checked(cpi_context, self.vault.amount, self.mint_a.decimals)?;

        // Close vault Account and transfer rent to maker
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
