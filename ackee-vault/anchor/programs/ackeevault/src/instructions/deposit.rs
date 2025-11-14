use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};

use crate::VaultState;

#[derive(Accounts)]
#[instruction(vault_id:u16)]
pub struct Deposit<'info> {
    #[account(mut)]
    maker: Signer<'info>,
    #[account(
        seeds=[b"vault_state",maker.key().as_ref(),vault_id.to_le_bytes().as_ref()],
        bump=vault_state.state_bump
    )]
    vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds=[b"vault",vault_state.key().as_ref()],
        bump=vault_state.vault_bump,
    )]
    vault: SystemAccount<'info>,
    system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn deposit(&mut self, vault_id: u16, amount: u64) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.maker.to_account_info(),
            to: self.vault.to_account_info(),
        };
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_context, amount)
    }
}
